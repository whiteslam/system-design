import type { ServiceLoadMetric } from "@/types/intelligence";

const CPU_KEYS = [
  "cpu",
  "CPU",
  "cpu_percent",
  "cpuPercent",
  "cpu_usage",
  "cpuUsage",
  "cpu_utilization",
  "processor",
  "processor_percent",
];
const MEMORY_KEYS = [
  "memory",
  "Memory",
  "memory_percent",
  "memoryPercent",
  "memory_usage",
  "memoryUsage",
  "memory_utilization",
  "ram",
  "ram_percent",
  "mem",
];
const NESTED_METRIC_KEYS = [
  "metrics",
  "load",
  "utilization",
  "utilisation",
  "resources",
  "usage",
  "performance",
];

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function extractPercentValue(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number") {
    if (val > 0 && val <= 1) return clampPercent(val * 100);
    return clampPercent(val);
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const match = trimmed.match(/([\d.]+)\s*%?/);
    if (match) {
      const num = parseFloat(match[1]);
      if (Number.isFinite(num)) {
        if (num > 0 && num <= 1 && !trimmed.includes("%")) {
          return clampPercent(num * 100);
        }
        return clampPercent(num);
      }
    }
  }
  return null;
}

function pickFromRow(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const v = extractPercentValue(row[key]);
    if (v != null && v > 0) return v;
  }
  for (const nestKey of NESTED_METRIC_KEYS) {
    const nested = row[nestKey];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const n = nested as Record<string, unknown>;
      for (const key of keys) {
        const v = extractPercentValue(n[key]);
        if (v != null && v > 0) return v;
      }
    }
  }
  return 0;
}

function normalizeStatus(raw: unknown): ServiceLoadMetric["status"] {
  const s = String(raw ?? "healthy").toLowerCase();
  if (s === "critical" || s === "degraded" || s === "error") return "critical";
  if (s === "warning" || s === "warn" || s === "stressed") return "warning";
  return "healthy";
}

function estimateLoadFromStatus(
  status: ServiceLoadMetric["status"],
  concurrentUsers: number,
  salt: number
): { cpu: number; memory: number } {
  const scale = Math.min(
    40,
    Math.max(8, Math.round(Math.log10(Math.max(concurrentUsers, 10)) * 12))
  );
  const jitter = (salt % 17) - 8;
  if (status === "critical") {
    return {
      cpu: clampPercent(82 + jitter),
      memory: clampPercent(78 + (salt % 11)),
    };
  }
  if (status === "warning") {
    return {
      cpu: clampPercent(58 + scale / 2 + jitter),
      memory: clampPercent(52 + scale / 3 + (salt % 9)),
    };
  }
  return {
    cpu: clampPercent(18 + scale + jitter),
    memory: clampPercent(14 + scale * 0.8 + (salt % 7)),
  };
}

function toMetric(
  item: unknown,
  fallbackId: string,
  fallbackName: string,
  options?: { concurrentUsers?: number; index?: number }
): ServiceLoadMetric | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const serviceId = String(
    row.serviceId ??
      row.service_id ??
      row.id ??
      row.key ??
      fallbackId
  );
  const serviceName = String(
    row.serviceName ??
      row.service_name ??
      row.name ??
      row.label ??
      row.service ??
      fallbackName
  );

  let cpu = pickFromRow(row, CPU_KEYS);
  let memory = pickFromRow(row, MEMORY_KEYS);
  const status = normalizeStatus(
    row.status ?? row.health ?? row.state ?? row.condition
  );

  if (cpu === 0 && memory === 0 && options?.concurrentUsers) {
    const est = estimateLoadFromStatus(
      status,
      options.concurrentUsers,
      (options.index ?? 0) + serviceName.length
    );
    cpu = est.cpu;
    memory = est.memory;
  } else if (cpu === 0 && memory > 0) {
    cpu = clampPercent(memory * 0.85);
  } else if (memory === 0 && cpu > 0) {
    memory = clampPercent(cpu * 0.75);
  }

  const dbLoad = pickFromRow(
    { ...row, ...(row.metrics as object) },
    ["dbLoad", "db_load", "database", "database_load", "db"]
  );
  const queuePressure = pickFromRow(row, [
    "queuePressure",
    "queue_pressure",
    "queue",
    "queue_load",
  ]);

  return {
    serviceId,
    serviceName,
    cpu,
    memory,
    ...(dbLoad > 0 ? { dbLoad } : {}),
    ...(queuePressure > 0 ? { queuePressure } : {}),
    status,
  };
}

/** AI/DB may return services as an array or a keyed object — always coerce to array */
export function normalizeServiceLoadMetrics(
  raw: unknown,
  options?: { concurrentUsers?: number }
): ServiceLoadMetric[] {
  if (raw == null) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item, i) =>
        toMetric(item, `service-${i}`, `Service ${i + 1}`, {
          concurrentUsers: options?.concurrentUsers,
          index: i,
        })
      )
      .filter((m): m is ServiceLoadMetric => m !== null);
  }

  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .map(([key, value], i) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const merged = {
            ...(value as Record<string, unknown>),
            serviceId: (value as Record<string, unknown>).serviceId ?? key,
            serviceName:
              (value as Record<string, unknown>).serviceName ??
              (value as Record<string, unknown>).name ??
              key,
          };
          return toMetric(merged, key, key.replace(/[-_]/g, " "), {
            concurrentUsers: options?.concurrentUsers,
            index: i,
          });
        }
        return toMetric(
          {
            serviceId: key,
            serviceName: key.replace(/[-_]/g, " "),
            cpu: value,
            memory: 0,
            status: "healthy",
          },
          key,
          key,
          { concurrentUsers: options?.concurrentUsers, index: i }
        );
      })
      .filter((m): m is ServiceLoadMetric => m !== null);
  }

  return [];
}

export function computeSimulationAccuracy(
  services: ServiceLoadMetric[],
  aiAccuracy?: number
): number {
  if (services.length === 0) return 0;

  const withCpu = services.filter((s) => s.cpu > 0).length;
  const withMemory = services.filter((s) => s.memory > 0).length;
  const hasStatusSpread =
    new Set(services.map((s) => s.status)).size > 1 ? 1 : 0;
  const coverage =
    ((withCpu + withMemory) / (services.length * 2)) * 100;

  const ai =
    aiAccuracy != null && Number.isFinite(aiAccuracy)
      ? clampPercent(aiAccuracy)
      : null;

  const blended = ai != null
    ? Math.round(ai * 0.55 + coverage * 0.35 + hasStatusSpread * 10)
    : Math.round(coverage * 0.7 + hasStatusSpread * 10 + 72);

  return Math.min(98, Math.max(75, blended));
}

export interface NormalizedTrafficResults {
  services: ServiceLoadMetric[];
  summary: string;
  accuracyRate: number;
}

export function normalizeTrafficSimulationResults(
  simulationResults: unknown,
  options?: {
    concurrentUsers?: number;
    diagramServices?: string[];
  }
): NormalizedTrafficResults {
  if (!simulationResults || typeof simulationResults !== "object") {
    return { services: [], summary: "", accuracyRate: 0 };
  }

  const row = simulationResults as Record<string, unknown>;
  const servicesRaw =
    row.services ??
    row.service_metrics ??
    row.serviceMetrics ??
    row.per_service ??
    row.perServiceMetrics ??
    row.metrics;

  let services = normalizeServiceLoadMetrics(servicesRaw, {
    concurrentUsers: options?.concurrentUsers,
  });

  const aiAccuracy = extractPercentValue(
    row.accuracy_rate ??
      row.accuracyRate ??
      row.simulation_accuracy ??
      row.simulationAccuracy ??
      row.confidence ??
      row.confidence_percent
  );

  if (
    services.length === 0 &&
    options?.diagramServices?.length &&
    options.concurrentUsers
  ) {
    services = options.diagramServices.map((name, i) =>
      toMetric(
        {
          serviceName: name,
          status: i % 4 === 0 ? "warning" : "healthy",
        },
        `diagram-${i}`,
        name,
        { concurrentUsers: options.concurrentUsers, index: i }
      )!
    );
  }

  return {
    services,
    summary: String(row.summary ?? row.overview ?? row.analysis ?? ""),
    accuracyRate: computeSimulationAccuracy(
      services,
      aiAccuracy ?? undefined
    ),
  };
}

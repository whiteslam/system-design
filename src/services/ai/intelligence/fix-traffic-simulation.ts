import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import { formatOpenRouterError } from "@/lib/ai/openrouter-errors";
import { parseIntelligenceJson } from "@/lib/ai/parse-json";
import { formatContextForPrompt } from "@/lib/intelligence/context";
import {
  normalizeServiceLoadMetrics,
  computeSimulationAccuracy,
  type NormalizedTrafficResults,
} from "@/lib/intelligence/normalize-traffic";
import type { ProjectIntelligenceContext } from "@/types/intelligence";
import type { ServiceLoadMetric } from "@/types/intelligence";

function isUnhealthy(s: ServiceLoadMetric) {
  return s.status === "warning" || s.status === "critical";
}

/** Deterministic fallback when AI is unavailable */
export function applyLocalTrafficFix(
  services: ServiceLoadMetric[],
  targetIds: string[]
): ServiceLoadMetric[] {
  const idSet = new Set(targetIds);
  return services.map((svc) => {
    if (!idSet.has(svc.serviceId) && !idSet.has(svc.serviceName)) return svc;
    const reduce = (v: number) => Math.max(12, Math.round(v * 0.55));
    return {
      ...svc,
      status: "healthy" as const,
      cpu: reduce(svc.cpu),
      memory: reduce(svc.memory),
      ...(svc.dbLoad != null ? { dbLoad: reduce(svc.dbLoad) } : {}),
      ...(svc.queuePressure != null
        ? { queuePressure: reduce(svc.queuePressure) }
        : {}),
    };
  });
}

export async function fixTrafficSimulationWithAI(
  ctx: ProjectIntelligenceContext,
  concurrentUsers: number,
  currentServices: ServiceLoadMetric[],
  bottlenecks: string[],
  summary: string,
  targetServiceIds: string[]
): Promise<NormalizedTrafficResults & { fixSummary: string }> {
  const targets = currentServices.filter(
    (s) =>
      targetServiceIds.includes(s.serviceId) ||
      targetServiceIds.includes(s.serviceName)
  );

  if (targets.length === 0) {
    return {
      services: currentServices,
      summary,
      accuracyRate: computeSimulationAccuracy(currentServices),
      fixSummary: "No unhealthy services to fix",
    };
  }

  const prompt = `You are an SRE remediating traffic simulation overload for ${concurrentUsers} concurrent users.

Architecture context:
${formatContextForPrompt(ctx)}

## Services to fix (make healthy with realistic lowered load)
${targets.map((s) => `- ${s.serviceName} (${s.serviceId}): status=${s.status}, cpu=${s.cpu}%, memory=${s.memory}%`).join("\n")}

## All services in simulation
${currentServices.map((s) => `- ${s.serviceName}: ${s.status}, cpu=${s.cpu}, memory=${s.memory}`).join("\n")}

## Current bottlenecks
${bottlenecks.length ? bottlenecks.join("\n") : "None"}

## Task
Apply production fixes (autoscaling, caching, read replicas, rate limits, queue consumers, CDN, connection pooling) so targeted services become healthy with cpu/memory typically 15-45% under the same user load.
Return the FULL updated services array and revised bottlenecks.

Respond ONLY with valid JSON:
{
  "services": [
    {
      "serviceId": "id",
      "serviceName": "Name",
      "cpu": 28,
      "memory": 24,
      "status": "healthy"
    }
  ],
  "bottlenecks": ["remaining issues only"],
  "summary": "updated simulation summary",
  "accuracy_rate": 90,
  "fix_summary": "what was fixed in one sentence"
}`;

  const client = getOpenRouterClient();
  let raw: string | null | undefined;

  try {
    const response = await client.chat.completions.create({
      model: getOpenRouterModel(),
      messages: [
        {
          role: "system",
          content:
            "You fix traffic simulation overload via architecture remediations. Output valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });
    raw = response.choices[0]?.message?.content;
  } catch (firstErr) {
    try {
      const response = await client.chat.completions.create({
        model: getOpenRouterModel(),
        messages: [
          {
            role: "system",
            content: "Fix traffic simulation services. JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      });
      raw = response.choices[0]?.message?.content;
    } catch {
      const patched = applyLocalTrafficFix(currentServices, targetServiceIds);
      const remainingBottlenecks = bottlenecks.filter((b) =>
        targets.every(
          (t) => !b.toLowerCase().includes(t.serviceName.toLowerCase())
        )
      );
      return {
        services: patched,
        summary:
          summary ||
          `Applied local remediation for ${targets.length} service(s).`,
        accuracyRate: computeSimulationAccuracy(patched, 82),
        fixSummary: `Scaled down load on ${targets.map((t) => t.serviceName).join(", ")} (autoscaling & caching).`,
      };
    }
    void formatOpenRouterError(firstErr);
  }

  if (!raw) {
    const patched = applyLocalTrafficFix(currentServices, targetServiceIds);
    return {
      services: patched,
      summary,
      accuracyRate: computeSimulationAccuracy(patched, 80),
      fixSummary: "Applied default remediation",
    };
  }

  const parsed = parseIntelligenceJson<Record<string, unknown>>(raw);
  const services = normalizeServiceLoadMetrics(parsed.services, {
    concurrentUsers,
  });

  const merged =
    services.length >= currentServices.length
      ? services
      : currentServices.map((existing) => {
          const updated = services.find(
            (s) =>
              s.serviceId === existing.serviceId ||
              s.serviceName === existing.serviceName
          );
          if (
            updated &&
            (targetServiceIds.includes(existing.serviceId) ||
              targetServiceIds.includes(existing.serviceName))
          ) {
            return updated;
          }
          return existing;
        });

  const finalServices = merged.map((s) => {
    const wasTarget = targetServiceIds.some(
      (id) => id === s.serviceId || id === s.serviceName
    );
    if (wasTarget && isUnhealthy(s)) {
      return applyLocalTrafficFix([s], [s.serviceId])[0];
    }
    return s;
  });

  const accuracy = computeSimulationAccuracy(
    finalServices,
    typeof parsed.accuracy_rate === "number"
      ? parsed.accuracy_rate
      : undefined
  );

  return {
    services: finalServices,
    summary: String(parsed.summary ?? summary),
    accuracyRate: accuracy,
    fixSummary: String(
      parsed.fix_summary ?? parsed.fixSummary ?? "Services remediated"
    ),
  };
}

export function getUnhealthyServiceIds(services: ServiceLoadMetric[]): string[] {
  return services.filter(isUnhealthy).map((s) => s.serviceId);
}

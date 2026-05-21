"use client";

import { Gauge, Loader2, ShieldCheck, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceLoadMetric } from "@/types/intelligence";
import { cn } from "@/lib/utils";

interface TrafficSimulationViewProps {
  services: ServiceLoadMetric[];
  concurrentUsers: number;
  summary?: string;
  accuracyRate?: number;
  bottlenecks?: string[];
  onFixService?: (serviceId: string) => void;
  onFixAllUnhealthy?: () => void;
  fixingServiceId?: string | null;
  isFixingAll?: boolean;
  isFixPending?: boolean;
}

function statusVariant(s: ServiceLoadMetric["status"]) {
  if (s === "critical") return "default" as const;
  if (s === "warning") return "warning" as const;
  return "success" as const;
}

function isUnhealthy(s: ServiceLoadMetric) {
  return s.status === "warning" || s.status === "critical";
}

function accuracyTone(rate: number) {
  if (rate >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
  if (rate >= 80) return "text-primary border-primary/40 bg-primary/10";
  return "text-amber-400 border-amber-500/40 bg-amber-500/10";
}

export function TrafficSimulationView({
  services: servicesProp,
  concurrentUsers,
  summary,
  accuracyRate = 0,
  bottlenecks,
  onFixService,
  onFixAllUnhealthy,
  fixingServiceId = null,
  isFixingAll = false,
  isFixPending = false,
}: TrafficSimulationViewProps) {
  const services = Array.isArray(servicesProp) ? servicesProp : [];
  const displayAccuracy = Math.min(98, Math.max(0, Math.round(accuracyRate)));
  const unhealthyCount = services.filter(isUnhealthy).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-stretch">
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 sm:rounded-2xl sm:px-6 sm:py-4">
          <p className="text-xs text-muted-foreground">Concurrent users</p>
          <p className="text-2xl font-bold text-primary sm:text-3xl">
            {concurrentUsers.toLocaleString()}
          </p>
        </div>

        {displayAccuracy > 0 && (
          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col justify-center rounded-xl border px-4 py-3 sm:min-w-[200px] sm:rounded-2xl sm:px-6 sm:py-4",
              accuracyTone(displayAccuracy)
            )}
          >
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-90">
              <Target className="h-3.5 w-3.5" />
              Simulation accuracy
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold sm:text-3xl">{displayAccuracy}%</span>
              <span className="hidden text-xs opacity-80 sm:inline">
                {displayAccuracy >= 90
                  ? "High confidence"
                  : displayAccuracy >= 80
                    ? "Good match"
                    : "Estimate — re-run for higher confidence"}
              </span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/40">
              <div
                className="h-full rounded-full bg-current opacity-60 transition-[width] duration-700 ease-out"
                style={{ width: `${displayAccuracy}%` }}
              />
            </div>
          </div>
        )}

        {unhealthyCount > 0 && onFixAllUnhealthy && (
          <div className="flex flex-col justify-center">
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="h-10 shrink-0"
              disabled={isFixPending}
              onClick={onFixAllUnhealthy}
            >
              {isFixingAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fixing {unhealthyCount} services…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Fix all unhealthy ({unhealthyCount})
                </>
              )}
            </Button>
          </div>
        )}

        {summary && (
          <p className="flex flex-1 items-center text-sm leading-relaxed text-muted-foreground lg:min-w-0">
            {summary}
          </p>
        )}
      </div>

      {bottlenecks && bottlenecks.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-400">
              <Gauge className="h-4 w-4" />
              Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {bottlenecks.map((b) => (
              <p key={b} className="text-sm text-muted-foreground">
                • {b}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {services.map((svc, i) => {
          const unhealthy = isUnhealthy(svc);
          const fixing =
            isFixPending &&
            (fixingServiceId === svc.serviceId ||
              fixingServiceId === "all" ||
              (isFixingAll && unhealthy));

          return (
            <div key={`${svc.serviceId}-${i}`}>
              <Card
                className={cn(
                  "border-border/50 bg-card/40",
                  svc.status === "critical" && "border-red-500/40",
                  svc.status === "warning" && "border-amber-500/40"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <CardTitle className="text-sm leading-snug">
                    {svc.serviceName}
                  </CardTitle>
                  <Badge variant={statusVariant(svc.status)}>{svc.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "CPU", value: svc.cpu },
                    { label: "Memory", value: svc.memory },
                    ...(svc.dbLoad != null && svc.dbLoad > 0
                      ? [{ label: "DB load", value: svc.dbLoad }]
                      : []),
                    ...(svc.queuePressure != null && svc.queuePressure > 0
                      ? [{ label: "Queue", value: svc.queuePressure }]
                      : []),
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-medium tabular-nums">
                          {m.value}%
                        </span>
                      </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500 ease-out",
                          m.value > 85
                            ? "bg-red-500"
                            : m.value > 65
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.max(m.value, 2)}%` }}
                      />
                    </div>
                    </div>
                  ))}

                  {unhealthy && onFixService && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 h-8 w-full border-emerald-500/40 text-xs text-emerald-400 hover:bg-emerald-500/10"
                      disabled={isFixPending}
                      onClick={() => onFixService(svc.serviceId)}
                    >
                      {fixing ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Fixing…
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          Fix
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

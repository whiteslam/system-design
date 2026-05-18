"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceLoadMetric } from "@/types/intelligence";
import { cn } from "@/lib/utils";

interface TrafficSimulationViewProps {
  services: ServiceLoadMetric[];
  concurrentUsers: number;
  summary?: string;
  bottlenecks?: string[];
}

function statusVariant(s: ServiceLoadMetric["status"]) {
  if (s === "critical") return "default" as const;
  if (s === "warning") return "warning" as const;
  return "success" as const;
}

export function TrafficSimulationView({
  services,
  concurrentUsers,
  summary,
  bottlenecks,
}: TrafficSimulationViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-6 py-4">
          <p className="text-xs text-muted-foreground">Concurrent users</p>
          <p className="text-3xl font-bold text-primary">
            {concurrentUsers.toLocaleString()}
          </p>
        </div>
        {summary && (
          <p className="flex-1 text-sm text-muted-foreground">{summary}</p>
        )}
      </div>

      {bottlenecks && bottlenecks.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-400">Bottlenecks</CardTitle>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((svc, i) => (
          <motion.div
            key={svc.serviceId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={cn(
                "border-border/50 bg-card/40",
                svc.status === "critical" && "border-red-500/40",
                svc.status === "warning" && "border-amber-500/40"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{svc.serviceName}</CardTitle>
                <Badge variant={statusVariant(svc.status)}>{svc.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "CPU", value: svc.cpu },
                  { label: "Memory", value: svc.memory },
                  ...(svc.dbLoad != null ? [{ label: "DB load", value: svc.dbLoad }] : []),
                  ...(svc.queuePressure != null
                    ? [{ label: "Queue", value: svc.queuePressure }]
                    : []),
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span>{m.value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          m.value > 85
                            ? "bg-red-500"
                            : m.value > 65
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

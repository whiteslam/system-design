"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runTrafficSimulation } from "@/actions/intelligence";
import { TrafficSimulationView } from "@/components/intelligence/traffic-simulation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
import type { TrafficSimulation, ServiceLoadMetric } from "@/types/intelligence";

const PRESETS = [
  { label: "1K users", users: 1000 },
  { label: "100K users", users: 100_000 },
  { label: "1M users", users: 1_000_000 },
  { label: "Traffic spike", users: 250_000 },
];

export function SimulationsPanel({
  projectId,
  initialSimulation,
}: {
  projectId: string;
  initialSimulation: TrafficSimulation | null;
}) {
  const [simulation, setSimulation] = useState(initialSimulation);
  const [pending, startTransition] = useTransition();

  const run = (users: number) => {
    startTransition(async () => {
      const result = await runTrafficSimulation(projectId, users);
      if (result.error) toast.error(result.error);
      else if (result.data) {
        setSimulation(result.data as TrafficSimulation);
        toast.success("Simulation complete");
      }
    });
  };

  const results = simulation?.simulation_results as
    | { services: ServiceLoadMetric[]; summary: string }
    | undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.users}
            variant="outline"
            disabled={pending}
            onClick={() => run(p.users)}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {p.label}
          </Button>
        ))}
      </div>

      {!simulation ? (
        <Card className="border-dashed py-16 text-center text-muted-foreground">
          Pick a traffic profile to simulate load across your architecture.
        </Card>
      ) : (
        <TrafficSimulationView
          services={results?.services ?? []}
          concurrentUsers={simulation.concurrent_users}
          summary={results?.summary}
          bottlenecks={simulation.bottlenecks as string[]}
        />
      )}
    </div>
  );
}

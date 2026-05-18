"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runScalabilityPlan, runCloudRecommendation, runObservabilityPlan } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Cloud, Activity } from "lucide-react";
import type { ScalabilityPlan, CloudRecommendation, ObservabilityPlan } from "@/types/intelligence";

export function ScalingPanel({ projectId }: { projectId: string }) {
  const [plan, setPlan] = useState<ScalabilityPlan | null>(null);
  const [cloud, setCloud] = useState<CloudRecommendation | null>(null);
  const [obs, setObs] = useState<ObservabilityPlan | null>(null);
  const [pending, startTransition] = useTransition();

  const loadAll = () => {
    startTransition(async () => {
      const [p, c, o] = await Promise.all([
        runScalabilityPlan(projectId),
        runCloudRecommendation(projectId),
        runObservabilityPlan(projectId),
      ]);
      if (p.error) toast.error(p.error);
      else if (p.data) setPlan(p.data as ScalabilityPlan);
      if (c.data) setCloud(c.data as CloudRecommendation);
      if (o.data) setObs(o.data as ObservabilityPlan);
      toast.success("Scaling intelligence loaded");
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={loadAll} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
          Generate scaling plan
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {cloud && (
          <Card className="border-primary/30 bg-primary/5 lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <CardTitle>Cloud recommendation: {cloud.primary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{cloud.reasoning}</p>
              <p>
                <span className="text-foreground">Alternatives: </span>
                {cloud.alternatives.join(", ")}
              </p>
            </CardContent>
          </Card>
        )}
        {plan?.strategies.map((s, i) => (
          <Card key={i} className="border-border/50 bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{s.title}</CardTitle>
              <Badge variant={s.priority === "high" ? "warning" : "default"}>
                {s.priority}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </CardContent>
          </Card>
        ))}
        {!plan && !cloud && !obs && !pending && (
          <Card className="border-dashed border-border/50 py-16 text-center text-muted-foreground lg:col-span-2">
            Generate a scaling plan to see strategies, cloud fit, and observability.
          </Card>
        )}
        {obs && (
          <Card className="border-border/50 bg-card/30 lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle>Observability stack</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {obs.tools.map((t) => (
                <div key={t.name} className="rounded-xl border border-border/50 p-3">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.purpose}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runCostEstimation } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CostChart } from "@/components/intelligence/cost-chart";
import { Loader2, DollarSign } from "lucide-react";
import type { CostEstimation, CostBreakdownItem } from "@/types/intelligence";

const PROVIDERS = ["AWS", "Vercel", "Supabase", "Cloudflare", "GCP", "Azure"];

export function CostsPanel({
  projectId,
  initialEstimation,
}: {
  projectId: string;
  initialEstimation: CostEstimation | null;
}) {
  const [estimation, setEstimation] = useState(initialEstimation);
  const [provider, setProvider] = useState(initialEstimation?.provider ?? "AWS");
  const [pending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await runCostEstimation(projectId, provider);
      if (result.error) toast.error(result.error);
      else if (result.data) {
        setEstimation(result.data as CostEstimation);
        toast.success("Cost estimate generated");
      }
    });
  };

  const items = ((estimation?.breakdown_json as { items?: CostBreakdownItem[] })?.items ??
    []) as CostBreakdownItem[];

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-full min-w-0 sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="gradient" onClick={run} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
          Estimate costs
        </Button>
      </div>
      {!estimation ? (
        <Card className="border-dashed py-10 sm:py-16 text-center text-muted-foreground">
          Select a provider and run cost estimation.
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-sm">{estimation.provider} estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold sm:text-3xl">
                  ${Number(estimation.estimated_monthly_cost).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ${Number(estimation.estimated_yearly_cost).toLocaleString()}/yr
                </p>
              </div>
              <CostChart items={items} />
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-sm">Optimizations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(estimation.optimizations as string[]).map((o, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  • {o}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

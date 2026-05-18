"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runArchitectureAnalysis } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/intelligence/score-ring";
import { CategoryScoreCard } from "@/components/intelligence/category-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import type { ArchitectureReport } from "@/types/intelligence";

const CATEGORIES = [
  { key: "scalability", label: "Scalability", field: "scalability_score" as const },
  { key: "reliability", label: "Reliability", field: "reliability_score" as const },
  { key: "security", label: "Security", field: "security_score" as const },
  { key: "performance", label: "Performance", field: "performance_score" as const },
  { key: "maintainability", label: "Maintainability", field: "maintainability_score" as const },
  { key: "cost_efficiency", label: "Cost Efficiency", field: "cost_efficiency_score" as const },
  { key: "availability", label: "Availability", field: "availability_score" as const },
  { key: "devops_readiness", label: "DevOps", field: "devops_readiness_score" as const },
];

interface AnalysisPanelProps {
  projectId: string;
  initialReport: ArchitectureReport | null;
}

export function AnalysisPanel({ projectId, initialReport }: AnalysisPanelProps) {
  const [report, setReport] = useState(initialReport);
  const [pending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await runArchitectureAnalysis(projectId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        setReport(result.data as ArchitectureReport);
        toast.success("Architecture analysis complete");
      }
    });
  };

  const insights = (report?.category_insights ?? {}) as Record<
    string,
    { score: number; explanation: string; recommendations: string[] }
  >;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          AI reviews your diagram, blueprint, and project constraints.
        </p>
        <Button variant="gradient" onClick={run} disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Run analysis
        </Button>
      </div>

      {!report ? (
        <Card className="border-dashed border-border/50 bg-card/30 py-16 text-center">
          <p className="text-muted-foreground">
            No report yet. Run analysis to get production readiness scores.
          </p>
        </Card>
      ) : (
        <>
          <div className="flex flex-col items-center gap-8 rounded-2xl border border-border/50 bg-card/30 p-8 lg:flex-row lg:items-start">
            <ScoreRing score={report.overall_score} label="Production readiness" />
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              {CATEGORIES.map((c, i) => (
                <CategoryScoreCard
                  key={c.key}
                  title={c.label}
                  score={report[c.field]}
                  insight={insights[c.key]}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </div>

          {report.warnings?.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-sm">Warnings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(report.warnings as { message: string; severity: string }[]).map(
                  (w, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="warning">{w.severity}</Badge>
                      <span className="text-muted-foreground">{w.message}</span>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}

          {report.recommendations?.length > 0 && (
            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-sm">Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(report.recommendations as string[]).map((r, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    • {r}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

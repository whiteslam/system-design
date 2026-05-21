"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runSecurityAnalysis } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import type { SecurityReport, SecurityVulnerability } from "@/types/intelligence";

const severityColor: Record<string, "default" | "warning" | "success"> = {
  low: "success",
  medium: "warning",
  high: "default",
  critical: "default",
};

export function SecurityPanel({
  projectId,
  initialReport,
}: {
  projectId: string;
  initialReport: SecurityReport | null;
}) {
  const [report, setReport] = useState(initialReport);
  const [pending, startTransition] = useTransition();

  const run = () => {
    startTransition(async () => {
      const result = await runSecurityAnalysis(projectId);
      if (result.error) toast.error(result.error);
      else if (result.data) {
        setReport(result.data as SecurityReport);
        toast.success("Security report generated");
      }
    });
  };

  const vulns = (report?.vulnerabilities ?? []) as SecurityVulnerability[];

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={run} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          Run security audit
        </Button>
      </div>
      {!report ? (
        <Card className="border-dashed py-10 sm:py-16 text-center text-muted-foreground">
          No security report yet.
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Overall risk:</span>
            <Badge variant={severityColor[report.overall_risk] ?? "warning"}>
              {report.overall_risk}
            </Badge>
          </div>
          <div className="grid gap-4">
            {vulns.map((v, i) => (
              <Card key={i} className="border-border/50 bg-card/30">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-base">{v.title}</CardTitle>
                  <Badge variant={severityColor[v.severity] ?? "default"}>
                    {v.severity}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{v.description}</p>
                  <p>
                    <span className="font-medium text-foreground">Fix: </span>
                    {v.remediation}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

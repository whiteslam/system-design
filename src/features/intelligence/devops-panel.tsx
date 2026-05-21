"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runDeploymentConfig } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy, Terminal } from "lucide-react";
import type { DeploymentConfig, DeploymentConfigType } from "@/types/intelligence";

const CONFIG_TYPES: { value: DeploymentConfigType; label: string }[] = [
  { value: "dockerfile", label: "Dockerfile" },
  { value: "docker-compose", label: "docker-compose.yml" },
  { value: "kubernetes", label: "Kubernetes YAML" },
  { value: "github-actions", label: "GitHub Actions" },
  { value: "nginx", label: "Nginx config" },
  { value: "terraform", label: "Terraform" },
];

export function DevOpsPanel({
  projectId,
  initialConfigs,
}: {
  projectId: string;
  initialConfigs: DeploymentConfig[];
}) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [configType, setConfigType] = useState<DeploymentConfigType>("dockerfile");
  const [activeCode, setActiveCode] = useState(
    initialConfigs[0]?.generated_code ?? ""
  );
  const [pending, startTransition] = useTransition();

  const generate = () => {
    startTransition(async () => {
      const result = await runDeploymentConfig(projectId, configType);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        const cfg = result.data as DeploymentConfig;
        setConfigs((prev) => [cfg, ...prev]);
        setActiveCode(cfg.generated_code);
        toast.success(`Generated ${result.filename ?? configType}`);
      }
    });
  };

  const loadConfig = (cfg: DeploymentConfig) => {
    setConfigType(cfg.config_type);
    setActiveCode(cfg.generated_code);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(activeCode);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={configType}
          onValueChange={(v) => setConfigType(v as DeploymentConfigType)}
        >
          <SelectTrigger className="w-full min-w-0 sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONFIG_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="gradient" onClick={generate} disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Terminal className="h-4 w-4" />
          )}
          Generate config
        </Button>
      </div>

      {configs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {configs.map((c) => (
            <Button
              key={c.id}
              variant={activeCode === c.generated_code ? "default" : "outline"}
              size="sm"
              onClick={() => loadConfig(c)}
            >
              {c.config_type}
            </Button>
          ))}
        </div>
      )}

      {!activeCode ? (
        <Card className="border-dashed py-16 text-center text-muted-foreground">
          Select a config type and generate production-ready deployment files.
        </Card>
      ) : (
        <Card className="border-border/50 bg-card/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-mono">{configType}</CardTitle>
            <Button variant="ghost" size="sm" onClick={copy}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[480px] overflow-auto rounded-xl bg-muted/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {activeCode}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

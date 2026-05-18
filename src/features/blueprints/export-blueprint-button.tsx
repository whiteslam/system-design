"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Blueprint } from "@/types";

interface ExportBlueprintButtonProps {
  blueprint: Blueprint;
}

export function ExportBlueprintButton({ blueprint }: ExportBlueprintButtonProps) {
  const handleExport = async () => {
    const sections = [
      ["# Overview", blueprint.overview],
      ["# Architecture", blueprint.architecture],
      ["# Database", blueprint.database_design],
      ["# APIs", blueprint.api_design],
      ["# Security", blueprint.security_plan],
      ["# Deployment", blueprint.deployment_plan],
      ["# Scaling", blueprint.scaling_strategy],
      ["# Recommended Stack", blueprint.recommended_stack],
      ["# Folder Structure", blueprint.folder_structure],
      ["# Tech Stack Reasoning", blueprint.tech_stack_reasoning],
    ];

    const markdown = sections
      .filter(([, content]) => content)
      .map(([title, content]) => `${title}\n\n${content}`)
      .join("\n\n---\n\n");

    const full = `# ${blueprint.title}\n\n${markdown}`;

    await navigator.clipboard.writeText(full);
    toast.success("Full blueprint copied to clipboard");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4" />
      Export all
    </Button>
  );
}

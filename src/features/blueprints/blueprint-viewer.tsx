"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBlueprintStore } from "@/store/blueprint-store";
import { BlueprintPromptPanel } from "@/features/blueprints/blueprint-prompt-panel";
import type { Blueprint, BlueprintSection } from "@/types";

const contentSections: {
  id: BlueprintSection;
  label: string;
  key: keyof Blueprint;
}[] = [
  { id: "overview", label: "Overview", key: "overview" },
  { id: "architecture", label: "Architecture", key: "architecture" },
  { id: "database", label: "Database", key: "database_design" },
  { id: "apis", label: "APIs", key: "api_design" },
  { id: "security", label: "Security", key: "security_plan" },
  { id: "deployment", label: "Deployment", key: "deployment_plan" },
  { id: "scaling", label: "Scaling", key: "scaling_strategy" },
  { id: "stack", label: "Recommended Stack", key: "recommended_stack" },
];

const promptNavItem = {
  id: "prompt" as const,
  label: "Full prompt",
  icon: Sparkles,
};

interface BlueprintViewerProps {
  blueprint: Blueprint;
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy}>
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

export function BlueprintViewer({ blueprint }: BlueprintViewerProps) {
  const { activeSection, setActiveSection } = useBlueprintStore();
  const isPromptView = activeSection === "prompt";
  const current =
    contentSections.find((s) => s.id === activeSection) ?? contentSections[0];
  const content = isPromptView
    ? null
    : (blueprint[current.key] as string | null);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="lg:w-56 lg:shrink-0">
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
          <div className="flex gap-2 lg:sticky lg:top-8 lg:block lg:space-y-1 lg:rounded-2xl lg:border lg:border-border/50 lg:bg-card/30 lg:p-2 lg:backdrop-blur-xl">
            {contentSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors duration-150 lg:w-full",
                  activeSection === section.id
                    ? "border border-primary/20 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {section.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveSection(promptNavItem.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors duration-150 lg:w-full",
                activeSection === promptNavItem.id
                  ? "border border-primary/20 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <promptNavItem.icon className="h-4 w-4 shrink-0" />
              {promptNavItem.label}
            </button>
          </div>
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        {isPromptView ? (
          <BlueprintPromptPanel blueprint={blueprint} />
        ) : (
          <>
            <Card className="border-border/50 bg-card/30">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg sm:text-xl">
                  {current.label}
                </CardTitle>
                {content && <CopyButton content={content} />}
              </CardHeader>
              <CardContent>
                {content ? (
                  <MarkdownContent content={content} />
                ) : (
                  <p className="text-muted-foreground">No content available.</p>
                )}
              </CardContent>
            </Card>

            {(activeSection === "stack" || activeSection === "overview") && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {blueprint.folder_structure && (
                  <Card className="border-border/50 bg-card/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">
                        Folder Structure
                      </CardTitle>
                      <CopyButton content={blueprint.folder_structure} />
                    </CardHeader>
                    <CardContent>
                      <MarkdownContent content={blueprint.folder_structure} />
                    </CardContent>
                  </Card>
                )}
                {blueprint.tech_stack_reasoning && (
                  <Card className="border-border/50 bg-card/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">
                        Tech Stack Reasoning
                      </CardTitle>
                      <CopyButton content={blueprint.tech_stack_reasoning} />
                    </CardHeader>
                    <CardContent>
                      <MarkdownContent
                        content={blueprint.tech_stack_reasoning}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

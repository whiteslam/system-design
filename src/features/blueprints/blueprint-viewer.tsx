"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/shared/markdown-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBlueprintStore } from "@/store/blueprint-store";
import type { Blueprint, BlueprintSection } from "@/types";

const sections: { id: BlueprintSection; label: string; key: keyof Blueprint }[] = [
  { id: "overview", label: "Overview", key: "overview" },
  { id: "architecture", label: "Architecture", key: "architecture" },
  { id: "database", label: "Database", key: "database_design" },
  { id: "apis", label: "APIs", key: "api_design" },
  { id: "security", label: "Security", key: "security_plan" },
  { id: "deployment", label: "Deployment", key: "deployment_plan" },
  { id: "scaling", label: "Scaling", key: "scaling_strategy" },
  { id: "stack", label: "Recommended Stack", key: "recommended_stack" },
];

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
  const current = sections.find((s) => s.id === activeSection) ?? sections[0];
  const content = blueprint[current.key] as string | null;

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <nav className="lg:w-56 lg:shrink-0">
        <div className="sticky top-8 space-y-1 rounded-2xl border border-border/50 bg-card/30 p-2 backdrop-blur-xl">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-w-0 flex-1"
      >
        <Card className="border-border/50 bg-card/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{current.label}</CardTitle>
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
                  <CardTitle className="text-base">Folder Structure</CardTitle>
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
                  <CardTitle className="text-base">Tech Stack Reasoning</CardTitle>
                  <CopyButton content={blueprint.tech_stack_reasoning} />
                </CardHeader>
                <CardContent>
                  <MarkdownContent content={blueprint.tech_stack_reasoning} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

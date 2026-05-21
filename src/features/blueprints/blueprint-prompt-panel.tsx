"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Blueprint } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  buildMasterPrompt,
  countPromptCharacters,
  getDefaultPromptSelection,
  PROMPT_SECTIONS,
  type PromptSectionId,
} from "@/lib/blueprint/build-master-prompt";
import { cn } from "@/lib/utils";

interface BlueprintPromptPanelProps {
  blueprint: Blueprint;
}

export function BlueprintPromptPanel({ blueprint }: BlueprintPromptPanelProps) {
  const [enabled, setEnabled] = useState(getDefaultPromptSelection);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildMasterPrompt(blueprint, enabled),
    [blueprint, enabled]
  );

  const charCount = countPromptCharacters(prompt);
  const wordEstimate = Math.round(charCount / 5);
  const enabledCount = PROMPT_SECTIONS.filter((s) => enabled[s.id]).length;

  const toggle = (id: PromptSectionId, value: boolean) => {
    const section = PROMPT_SECTIONS.find((s) => s.id === id);
    if (section && !section.optional) return;
    setEnabled((prev) => ({ ...prev, [id]: value }));
  };

  const selectAll = () => {
    setEnabled(getDefaultPromptSelection());
  };

  const selectMinimal = () => {
    setEnabled({
      ...getDefaultPromptSelection(),
      context: true,
      overview: true,
      architecture: true,
      database: false,
      apis: false,
      security: false,
      deployment: false,
      scaling: false,
      stack: true,
      folder_structure: false,
      tech_stack_reasoning: false,
      instructions: true,
    });
  };

  const handleCopy = async () => {
    if (!prompt.trim()) {
      toast.error("Enable at least one section with content");
      return;
    }
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Full prompt copied — paste into any AI or handoff doc");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            Full detailed prompt
          </CardTitle>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Customize which blueprint sections to include, then copy one
            comprehensive implementation prompt for Cursor, Claude, ChatGPT, or
            your team.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/50 bg-background/50 px-2.5 py-1">
              {enabledCount} sections
            </span>
            <span className="rounded-full border border-border/50 bg-background/50 px-2.5 py-1">
              ~{wordEstimate.toLocaleString()} words
            </span>
            <span className="rounded-full border border-border/50 bg-background/50 px-2.5 py-1">
              {charCount.toLocaleString()} chars
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAll}>
              Include all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectMinimal}
            >
              Core only
            </Button>
            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={handleCopy}
              className="min-w-[140px]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy full prompt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-6">
        <Card className="border-border/50 bg-card/30 lg:sticky lg:top-8 lg:self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customize sections</CardTitle>
            <p className="text-xs text-muted-foreground">
              Turn off Deployment, Security, or any section you do not need in
              the handoff prompt.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {PROMPT_SECTIONS.map((section) => {
              const content = section.getContent(blueprint)?.trim();
              const hasContent = Boolean(content);
              const isOn = enabled[section.id];

              return (
                <div
                  key={section.id}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border border-border/40 p-3 transition-colors",
                    isOn && hasContent
                      ? "bg-primary/5 border-primary/20"
                      : "bg-background/20",
                    !hasContent && section.optional && "opacity-60"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <Label
                      htmlFor={`prompt-${section.id}`}
                      className="cursor-pointer text-sm font-medium leading-snug"
                    >
                      {section.label}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {section.description}
                    </p>
                    {!hasContent && section.optional && (
                      <p className="mt-1 text-[10px] text-amber-400">
                        No content in blueprint
                      </p>
                    )}
                    {!section.optional && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Always included
                      </p>
                    )}
                  </div>
                  <Switch
                    id={`prompt-${section.id}`}
                    checked={isOn}
                    disabled={!section.optional}
                    onCheckedChange={(v) => toggle(section.id, v)}
                    aria-label={`Include ${section.label}`}
                  />
                </div>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setEnabled(getDefaultPromptSelection())}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to defaults
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
            <CardTitle className="text-base">Generated prompt preview</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="scrollbar-none max-h-[min(70vh,640px)] overflow-auto rounded-xl border border-border/50 bg-background/60 p-4 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap font-mono">
              {prompt || "Enable sections on the left to build your prompt."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

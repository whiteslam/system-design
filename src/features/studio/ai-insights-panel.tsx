"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Lightbulb,
  Loader2,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import {
  fixAllHealthWarningsAction,
  fixHealthWarningAction,
  implementSuggestionAction,
} from "@/actions/diagram";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AIInsightsPanel() {
  const suggestions = useStudioStore((s) => s.suggestions);
  const healthWarnings = useStudioStore((s) => s.healthWarnings);
  const applySuggestionImplementation = useStudioStore(
    (s) => s.applySuggestionImplementation
  );

  const [isPending, startTransition] = useTransition();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  if (suggestions.length === 0 && healthWarnings.length === 0) {
    return null;
  }

  const runImplementation = async (suggestion: string) => {
    const state = useStudioStore.getState();
    return implementSuggestionAction(
      suggestion,
      state.getDiagramJson(),
      state.suggestions,
      state.healthWarnings
    );
  };

  const runHealthFix = async (warning: string) => {
    const state = useStudioStore.getState();
    return fixHealthWarningAction(
      warning,
      state.getDiagramJson(),
      state.suggestions,
      state.healthWarnings
    );
  };

  const runHealthFixAll = async () => {
    const state = useStudioStore.getState();
    return fixAllHealthWarningsAction(
      state.getDiagramJson(),
      state.suggestions,
      state.healthWarnings
    );
  };

  const applyResult = (
    result: Awaited<ReturnType<typeof runImplementation>>
  ) => {
    if (!("success" in result) || !result.success) {
      return {
        ok: false as const,
        error: "error" in result ? result.error : "Request failed",
      };
    }
    applySuggestionImplementation(result.implementation);
    return { ok: true as const, summary: result.implementation.summary };
  };

  const handleImplement = (suggestion: string) => {
    setActiveTask(`suggestion:${suggestion}`);
    setProgress(null);
    startTransition(async () => {
      const outcome = applyResult(await runImplementation(suggestion));
      if (!outcome.ok) {
        toast.error(outcome.error);
      } else {
        toast.success(outcome.summary);
      }
      setActiveTask(null);
    });
  };

  const handleImplementAll = () => {
    const queue = [...useStudioStore.getState().suggestions];
    if (queue.length === 0) return;

    setActiveTask("suggestions:all");
    setProgress({ current: 0, total: queue.length });

    startTransition(async () => {
      let completed = 0;
      const errors: string[] = [];

      for (let i = 0; i < queue.length; i++) {
        const suggestion = queue[i];
        const state = useStudioStore.getState();
        if (!state.suggestions.includes(suggestion)) continue;

        setProgress({ current: i + 1, total: queue.length });
        const outcome = applyResult(await runImplementation(suggestion));
        if (!outcome.ok) {
          errors.push(outcome.error);
          continue;
        }
        completed++;
      }

      setActiveTask(null);
      setProgress(null);

      if (completed > 0) {
        toast.success(
          `Implemented ${completed} of ${queue.length} suggestion${queue.length === 1 ? "" : "s"}`
        );
      }
      if (errors.length > 0) toast.error(errors[0]);
      if (completed === 0 && errors.length === 0) {
        toast.info("All suggestions were already applied");
      }
    });
  };

  const handleFixHealth = () => {
    const warnings = useStudioStore.getState().healthWarnings;
    if (warnings.length === 0) return;

    if (warnings.length === 1) {
      handleFixOneWarning(warnings[0]);
      return;
    }

    setActiveTask("health:all");
    setProgress(null);
    startTransition(async () => {
      const outcome = applyResult(await runHealthFixAll());
      setActiveTask(null);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      toast.success(outcome.summary);
    });
  };

  const handleFixOneWarning = (warning: string) => {
    setActiveTask(`health:${warning}`);
    setProgress(null);
    startTransition(async () => {
      const outcome = applyResult(await runHealthFix(warning));
      setActiveTask(null);
      if (!outcome.ok) {
        toast.error(outcome.error);
        return;
      }
      toast.success(outcome.summary);
    });
  };

  const healthScore =
    healthWarnings.length === 0
      ? "strong"
      : healthWarnings.length === 1
        ? "moderate"
        : "needs attention";

  const isImplementingAll = isPending && activeTask === "suggestions:all";
  const isFixingHealthAll = isPending && activeTask === "health:all";
  const isBusy = isPending;

  return (
    <div className="absolute bottom-2 left-0 right-0 z-10 mx-auto flex max-h-[38vh] max-w-2xl flex-col gap-1.5 overflow-y-auto px-2 safe-bottom sm:bottom-4 sm:max-h-[45vh] sm:gap-2 sm:px-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:px-4">
      {healthWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 backdrop-blur-xl sm:rounded-xl sm:px-4 sm:py-3">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Architecture health
              <span className="font-normal text-muted-foreground">
                ({healthWarnings.length})
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                  healthScore === "strong"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : healthScore === "moderate"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-destructive/20 text-destructive"
                )}
              >
                {healthScore}
              </span>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                className="h-8 shrink-0 text-xs"
                disabled={isBusy}
                onClick={handleFixHealth}
              >
                {isFixingHealthAll ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {progress
                      ? `Fixing ${progress.current}/${progress.total}…`
                      : "Fixing health…"}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Fix health
                  </>
                )}
              </Button>
            </div>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {healthWarnings.map((w) => {
              const loadingSingle = isPending && activeTask === `health:${w}`;
              return (
                <li
                  key={w}
                  className="rounded-lg border border-amber-500/20 bg-background/30 p-2.5"
                >
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    • {w}
                  </p>
                  {healthWarnings.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 w-full border-amber-500/30 text-xs text-amber-400 hover:bg-amber-500/10"
                      disabled={isBusy}
                      onClick={() => handleFixOneWarning(w)}
                    >
                      {loadingSingle ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Fixing…
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3" />
                          Fix this
                        </>
                      )}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {healthWarnings.length === 0 && suggestions.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Architecture health is strong — no open warnings.
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 backdrop-blur-xl sm:rounded-xl sm:px-4 sm:py-3">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Lightbulb className="h-3.5 w-3.5 shrink-0" />
              AI suggestions
              <span className="font-normal text-muted-foreground">
                ({suggestions.length})
              </span>
            </p>
            {suggestions.length > 1 && (
              <Button
                type="button"
                variant="gradient"
                size="sm"
                className="h-8 shrink-0 text-xs"
                disabled={isBusy}
                onClick={handleImplementAll}
              >
                {isImplementingAll ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {progress
                      ? `Implementing ${progress.current}/${progress.total}…`
                      : "Implementing all…"}
                  </>
                ) : (
                  <>
                    <Layers className="h-3.5 w-3.5" />
                    Implement all
                  </>
                )}
              </Button>
            )}
          </div>
          <ul className="space-y-3">
            {suggestions.map((s) => {
              const loadingSingle =
                isPending && activeTask === `suggestion:${s}`;
              return (
                <li
                  key={s}
                  className="rounded-lg border border-border/40 bg-background/30 p-2.5"
                >
                  <p className="text-xs leading-relaxed text-foreground">
                    {s}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 w-full text-xs"
                    disabled={isBusy}
                    onClick={() => handleImplement(s)}
                  >
                    {loadingSingle ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Implementing…
                      </>
                    ) : (
                      "Implement this"
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { GENERATION_STEPS } from "@/hooks/use-simulated-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeneratingOverlayProps {
  open: boolean;
  progress: number;
  phase: "generating" | "success" | "error";
  errorMessage?: string;
  onDismiss?: () => void;
  onViewBlueprint?: () => void;
}

export function GeneratingOverlay({
  open,
  progress,
  phase,
  errorMessage,
  onDismiss,
  onViewBlueprint,
}: GeneratingOverlayProps) {
  const displayPercent = phase === "success" ? 100 : progress;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-md safe-x sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            className="mx-auto w-full max-w-md rounded-t-2xl border border-border/50 bg-card/95 p-5 shadow-2xl backdrop-blur-xl safe-bottom sm:rounded-2xl sm:p-8"
          >
            <div
              className={cn(
                "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl sm:mb-6 sm:h-14 sm:w-14 sm:rounded-2xl",
                phase === "success" && "bg-emerald-500/20",
                phase === "error" && "bg-destructive/20",
                phase === "generating" &&
                  "bg-gradient-to-br from-violet-600 to-indigo-600"
              )}
            >
              {phase === "success" ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              ) : phase === "error" ? (
                <XCircle className="h-8 w-8 text-destructive" />
              ) : (
                <Sparkles className="h-7 w-7 text-white" />
              )}
            </div>

            <h3 className="text-center text-base font-semibold text-foreground sm:text-lg">
              {phase === "success"
                ? "Blueprint ready!"
                : phase === "error"
                  ? "Generation failed"
                  : "Architecting your system"}
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {phase === "success"
                ? "Your system blueprint was generated successfully."
                : phase === "error"
                  ? (errorMessage ?? "Something went wrong. Try again.")
                  : "Running multiple free AI models — usually 60–90 seconds"}
            </p>

            {phase === "success" && (
              <p className="mt-1 text-center text-xs font-medium text-emerald-400">
                Status: Completed
              </p>
            )}
            {phase === "error" && (
              <p className="mt-1 text-center text-xs font-medium text-destructive">
                Status: Failed
              </p>
            )}

            {phase === "generating" && (
              <ul className="mt-6 space-y-2 sm:mt-8 sm:space-y-3">
                {GENERATION_STEPS.map((step, i) => {
                  const stepThreshold = Math.floor(
                    ((i + 1) / GENERATION_STEPS.length) * 92
                  );
                  const done = progress >= stepThreshold;
                  const active =
                    !done &&
                    progress >=
                      Math.floor((i / GENERATION_STEPS.length) * 92);

                  return (
                    <li
                      key={step}
                      className={cn(
                        "flex items-center gap-3 text-sm transition-colors",
                        done
                          ? "text-foreground"
                          : active
                            ? "text-primary"
                            : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                          done
                            ? "bg-emerald-500/20 text-emerald-400"
                            : active
                              ? "bg-primary/25 text-primary"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      {step}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-6 sm:mt-8">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">Progress</span>
                <span
                  className={cn(
                    phase === "success" && "text-emerald-400",
                    phase === "error" && "text-destructive",
                    phase === "generating" && "text-primary"
                  )}
                >
                  {displayPercent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    phase === "success"
                      ? "bg-emerald-500"
                      : phase === "error"
                        ? "bg-destructive"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600"
                  )}
                  initial={false}
                  animate={{ width: `${displayPercent}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>

            {phase === "success" && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                {onViewBlueprint && (
                  <Button variant="gradient" className="w-full sm:w-auto" onClick={onViewBlueprint}>
                    View blueprint
                  </Button>
                )}
                {onDismiss && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={onDismiss}>
                    Close
                  </Button>
                )}
              </div>
            )}

            {phase === "error" && (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                {onDismiss && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={onDismiss}>
                    Close
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

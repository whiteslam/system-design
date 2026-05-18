"use client";

import { AlertTriangle, Lightbulb } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { cn } from "@/lib/utils";

export function AIInsightsPanel() {
  const suggestions = useStudioStore((s) => s.suggestions);
  const healthWarnings = useStudioStore((s) => s.healthWarnings);

  if (suggestions.length === 0 && healthWarnings.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex max-w-2xl -translate-x-1/2 flex-col gap-2 px-4">
      {healthWarnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 backdrop-blur-xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Architecture health
          </p>
          <ul className="space-y-1">
            {healthWarnings.map((w) => (
              <li key={w} className="text-xs text-muted-foreground">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 backdrop-blur-xl">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <Lightbulb className="h-3.5 w-3.5" />
            AI suggestions
          </p>
          <ul className="space-y-1">
            {suggestions.map((s) => (
              <li
                key={s}
                className={cn("text-xs text-muted-foreground")}
              >
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

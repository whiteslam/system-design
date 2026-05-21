"use client";

import { useEffect, useState } from "react";

const GENERATION_STEPS = [
  "Analyzing project requirements",
  "Querying multiple free AI models",
  "Designing system architecture",
  "Modeling database schema",
  "Combining model outputs",
  "Finalizing unified blueprint",
] as const;

/** Simulated progress while a long-running action is pending (caps at 92% until done). */
export function useSimulatedProgress(
  isActive: boolean,
  estimatedMs = 90_000
): { progress: number; stepIndex: number; stepLabel: string } {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    setProgress(0);
    const started = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - started;
      const ratio = Math.min(elapsed / estimatedMs, 1);
      const eased = 1 - Math.pow(1 - ratio, 1.4);
      setProgress(Math.min(92, Math.round(eased * 92)));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive, estimatedMs]);

  const stepIndex = Math.min(
    GENERATION_STEPS.length - 1,
    Math.floor((progress / 100) * GENERATION_STEPS.length)
  );

  return {
    progress,
    stepIndex,
    stepLabel: GENERATION_STEPS[stepIndex],
  };
}

export { GENERATION_STEPS };

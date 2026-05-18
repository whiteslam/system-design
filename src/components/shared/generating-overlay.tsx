"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const steps = [
  "Analyzing project requirements",
  "Designing system architecture",
  "Modeling database schema",
  "Defining API structure",
  "Planning security & deployment",
  "Finalizing blueprint",
];

interface GeneratingOverlayProps {
  open: boolean;
}

export function GeneratingOverlay({ open }: GeneratingOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-6 w-full max-w-md rounded-2xl border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl"
          >
            <motion.div
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-7 w-7 text-white" />
            </motion.div>
            <h3 className="text-center text-lg font-semibold">
              Architecting your system
            </h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              This usually takes 30–60 seconds
            </p>
            <ul className="mt-8 space-y-3">
              {steps.map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                initial={{ width: "0%" }}
                animate={{ width: "95%" }}
                transition={{ duration: 45, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

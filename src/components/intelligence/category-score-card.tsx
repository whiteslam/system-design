"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryInsight } from "@/types/intelligence";

interface CategoryScoreCardProps {
  title: string;
  score: number;
  insight?: CategoryInsight;
  delay?: number;
}

export function CategoryScoreCard({
  title,
  score,
  insight,
  delay = 0,
}: CategoryScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border/50 bg-card/40 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <span className="text-lg font-bold text-primary">{score}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: delay + 0.2, duration: 0.8 }}
            />
          </div>
        </CardHeader>
        {insight && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground line-clamp-3">
              {insight.explanation}
            </p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

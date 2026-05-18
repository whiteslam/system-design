"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CostBreakdownItem } from "@/types/intelligence";

const COLORS = ["#8b5cf6", "#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#ec4899"];

interface CostChartProps {
  items: CostBreakdownItem[];
}

export function CostChart({ items }: CostChartProps) {
  if (!items.length) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="category"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
            }}
            formatter={(value) => [
              `$${Number(value ?? 0).toFixed(0)}`,
              "Monthly",
            ]}
          />
          <Bar dataKey="monthly" radius={[6, 6, 0, 0]}>
            {items.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Shield,
  DollarSign,
  Terminal,
  Activity,
} from "lucide-react";

const MODULES = [
  { slug: "analysis", label: "Analysis", icon: BarChart3 },
  { slug: "scaling", label: "Scaling", icon: TrendingUp },
  { slug: "security", label: "Security", icon: Shield },
  { slug: "costs", label: "Costs", icon: DollarSign },
  { slug: "devops", label: "DevOps", icon: Terminal },
  { slug: "simulations", label: "Simulations", icon: Activity },
] as const;

export function IntelligenceNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-none -mx-1 flex gap-0.5 overflow-x-auto rounded-xl border border-border/50 bg-card/40 p-0.5 backdrop-blur-sm sm:mx-0 sm:gap-1 sm:rounded-2xl sm:p-1">
      {MODULES.map((m) => {
        const href = `/${m.slug}/${projectId}`;
        const active = pathname.startsWith(`/${m.slug}`);
        return (
          <Link
            key={m.slug}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm",
              active
                ? "bg-primary/15 text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}

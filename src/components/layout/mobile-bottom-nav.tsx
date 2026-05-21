"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Menu,
  BarChart3,
  Settings,
  TrendingUp,
  Shield,
  DollarSign,
  Terminal,
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import { useState } from "react";

const primaryNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/generate", label: "Create", icon: Sparkles, accent: true },
  { href: "/analysis", label: "Intel", icon: BarChart3 },
] as const;

const intelligenceLinks = [
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/scaling", label: "Scaling", icon: TrendingUp },
  { href: "/security", label: "Security", icon: Shield },
  { href: "/costs", label: "Costs", icon: DollarSign },
  { href: "/devops", label: "DevOps", icon: Terminal },
  { href: "/simulations", label: "Simulations", icon: Activity },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isIntelRoute = intelligenceLinks.some((item) => isActive(item.href));

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-md safe-bottom safe-x lg:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-[3.25rem] max-w-lg items-stretch justify-around px-1">
          {primaryNav.map((item) => {
            const accent = "accent" in item && item.accent;
            const active = accent
              ? pathname === "/generate"
              : item.href === "/analysis"
                ? isIntelRoute
                : isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "touch-manipulation flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition-transform active:scale-95",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                    accent && "bg-primary/15",
                    active && !accent && "bg-primary/10",
                    accent &&
                      active &&
                      "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-primary/30"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      accent && active && "text-white"
                    )}
                  />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "touch-manipulation flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium text-muted-foreground transition-transform active:scale-95",
              (menuOpen || pathname.startsWith("/settings")) &&
                "text-primary"
            )}
            aria-label="Open menu"
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl",
                (menuOpen || pathname.startsWith("/settings")) &&
                  "bg-primary/10"
              )}
            >
              <Menu className="h-[18px] w-[18px]" />
            </span>
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 bottom-0 z-[70] max-h-[min(70vh,520px)] overflow-hidden rounded-t-2xl border border-border/50 bg-card shadow-2xl safe-bottom lg:hidden animate-in slide-in-from-bottom duration-200">
            <div className="mx-auto mb-2 mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
            <div className="scrollbar-none overflow-y-auto px-3 pb-4">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Intelligence
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {intelligenceLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors active:scale-[0.98]",
                      isActive(item.href)
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-3 space-y-1 border-t border-border/50 pt-3">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
                    pathname.startsWith("/settings")
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground active:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

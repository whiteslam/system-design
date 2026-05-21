import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 px-5 py-10 text-center backdrop-blur-xl sm:rounded-2xl sm:px-8 sm:py-16">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
        <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
      </div>
      <h3 className="mb-1.5 text-base font-semibold sm:mb-2 sm:text-lg">{title}</h3>
      <p className="mb-4 max-w-sm text-xs text-muted-foreground sm:mb-6 sm:text-sm">{description}</p>
      {actionLabel && actionHref && (
        <Button variant="gradient" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

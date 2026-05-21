import { FolderKanban, FileText, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  projectCount: number;
  blueprintCount: number;
  completedCount: number;
}

export function StatsCards({
  projectCount,
  blueprintCount,
  completedCount,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Projects",
      value: projectCount,
      icon: FolderKanban,
    },
    {
      label: "Blueprints",
      value: blueprintCount,
      icon: FileText,
    },
    {
      label: "Completed",
      value: completedCount,
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/50 bg-card/30 transition-colors hover:border-primary/20"
        >
          <CardContent className="flex flex-col items-center gap-1.5 p-3 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-11 sm:w-11 sm:rounded-xl">
              <stat.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-none sm:text-2xl">
                {stat.value}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border/50 bg-card/30 transition-colors hover:border-primary/20"
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

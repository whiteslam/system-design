import Link from "next/link";
import { Calendar, Layers, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Blueprint, Project } from "@/types";

interface ProjectCardProps {
  project?: Project;
  blueprint?: Blueprint & {
    projects?: Pick<Project, "name" | "preferred_stack" | "scale" | "status">;
  };
  href: string;
  studioHref?: string;
}

const statusVariant: Record<string, "default" | "success" | "warning"> = {
  completed: "success",
  generating: "warning",
  draft: "default",
  failed: "default",
};

export function ProjectCard({
  project,
  blueprint,
  href,
  studioHref,
}: ProjectCardProps) {
  const name = project?.name ?? blueprint?.title ?? "Untitled";
  const stack =
    project?.preferred_stack ?? blueprint?.projects?.preferred_stack ?? "—";
  const scale = project?.scale ?? blueprint?.projects?.scale ?? "—";
  const status = project?.status ?? blueprint?.projects?.status ?? "completed";
  const date = project?.created_at ?? blueprint?.created_at ?? "";

  return (
    <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <Link href={href}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">
              {name}
            </CardTitle>
            <Badge variant={statusVariant[status] ?? "default"}>
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            <span className="truncate">{stack}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Scale: {scale}</span>
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(date)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
      {studioHref && project && (
        <div className="border-t border-border/50 px-4 py-3">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={studioHref}>
              <Workflow className="h-3.5 w-3.5" />
              Open Studio
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}

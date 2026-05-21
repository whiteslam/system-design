import Link from "next/link";
import { Calendar, Layers, Workflow } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCardMenu } from "@/components/dashboard/project-card-menu";
import { ProjectRetryButton } from "@/components/dashboard/project-retry-button";
import { formatDate } from "@/lib/utils";
import type { Blueprint, Project, ProjectStatus } from "@/types";

interface ProjectCardProps {
  project?: Project;
  blueprint?: Blueprint & {
    projects?: Pick<Project, "name" | "preferred_stack" | "scale" | "status">;
  };
  href: string;
  studioHref?: string;
  blueprintId?: string | null;
  showActions?: boolean;
}

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "destructive"
> = {
  completed: "success",
  generating: "warning",
  draft: "default",
  failed: "destructive",
};

export function ProjectCard({
  project,
  blueprint,
  href,
  studioHref,
  blueprintId: blueprintIdProp,
  showActions = false,
}: ProjectCardProps) {
  const name = project?.name ?? blueprint?.title ?? "Untitled";
  const stack =
    project?.preferred_stack ?? blueprint?.projects?.preferred_stack ?? "—";
  const scale = project?.scale ?? blueprint?.projects?.scale ?? "—";
  const status = (project?.status ??
    blueprint?.projects?.status ??
    "completed") as ProjectStatus;
  const date = project?.created_at ?? blueprint?.created_at ?? "";
  const projectId = project?.id ?? blueprint?.project_id;
  const blueprintId = blueprintIdProp ?? blueprint?.id ?? null;

  return (
    <Card className="group flex h-full flex-col transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="relative flex flex-1 flex-col">
        <Link href={href} className="flex flex-1 flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2 pr-8">
              <CardTitle className="line-clamp-1 text-base transition-colors group-hover:text-primary">
                {name}
              </CardTitle>
              <Badge
                variant={statusVariant[status] ?? "default"}
                className="shrink-0 capitalize"
              >
                {status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5 shrink-0" />
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

        {showActions && projectId && (
          <div className="absolute right-3 top-3">
            <ProjectCardMenu
              projectId={projectId}
              projectName={name}
              status={status}
              blueprintId={blueprintId}
            />
          </div>
        )}
      </div>

      {(status === "failed" || (studioHref && project && status !== "generating")) && (
        <div className="flex flex-col gap-2 border-t border-border/50 px-4 py-3">
          {status === "failed" && projectId && (
            <ProjectRetryButton projectId={projectId} />
          )}
          {studioHref && project && status !== "failed" && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={studioHref}>
                <Workflow className="h-3.5 w-3.5" />
                Open Studio
              </Link>
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

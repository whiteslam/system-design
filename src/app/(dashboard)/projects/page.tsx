import Link from "next/link";
import { Plus } from "lucide-react";
import { getProjects, getBlueprintProjectIndex } from "@/actions/blueprint";
import { ProjectCard } from "@/components/dashboard/project-card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
  const [projects, blueprintIndex] = await Promise.all([
    getProjects(),
    getBlueprintProjectIndex(),
  ]);

  const blueprintByProject = new Map(
    blueprintIndex.map((b) => [b.project_id, b.id])
  );

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Projects"
        description="All your projects and blueprints"
      >
        <Button variant="gradient" asChild>
          <Link href="/generate">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </Button>
      </DashboardHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project by generating your first system design blueprint."
          actionLabel="Generate blueprint"
          actionHref="/generate"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
          {projects.map((project) => {
            const blueprintId = blueprintByProject.get(project.id);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                href={
                  project.status === "completed" && blueprintId
                    ? `/blueprints/${blueprintId}`
                    : `/studio/${project.id}`
                }
                studioHref={`/studio/${project.id}`}
                blueprintId={blueprintId ?? null}
                showActions
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

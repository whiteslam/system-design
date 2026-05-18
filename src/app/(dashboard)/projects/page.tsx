import Link from "next/link";
import { Plus } from "lucide-react";
import { getProjects, getBlueprints } from "@/actions/blueprint";
import { ProjectCard } from "@/components/dashboard/project-card";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";

export default async function ProjectsPage() {
  const [projects, blueprints] = await Promise.all([
    getProjects(),
    getBlueprints(),
  ]);

  const blueprintByProject = new Map(
    blueprints.map((b) => [b.project_id, b])
  );

  return (
    <div className="space-y-8">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            return (
              <ProjectCard
                key={project.id}
                project={project}
                href={`/studio/${project.id}`}
                studioHref={`/studio/${project.id}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

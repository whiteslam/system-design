import Link from "next/link";
import { Plus, Sparkles, FolderKanban } from "lucide-react";
import { getDashboardPageData } from "@/actions/blueprint";
import { ProjectCard } from "@/components/dashboard/project-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default async function DashboardPage() {
  const { blueprints, projects, stats, firstName } = await getDashboardPageData();

  const blueprintByProject = new Map(
    blueprints.map((b) => [b.project_id, b.id])
  );

  return (
    <div className="space-y-10">
      <DashboardHeader
        title={`Welcome back, ${firstName}`}
        description="Your system design workspace"
      >
        <Button variant="gradient" asChild>
          <Link href="/generate">
            <Plus className="h-4 w-4" />
            New blueprint
          </Link>
        </Button>
      </DashboardHeader>

      <StatsCards
        projectCount={stats.projects}
        blueprintCount={stats.blueprints}
        completedCount={stats.completed}
      />

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent blueprints</h2>
          <Link
            href="/projects"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {blueprints.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No blueprints yet"
            description="Generate your first system design blueprint to get started."
            actionLabel="Generate blueprint"
            actionHref="/generate"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blueprints.map((bp) => (
              <ProjectCard
                key={bp.id}
                blueprint={bp}
                href={`/blueprints/${bp.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">Recent projects</h2>
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Projects are created when you generate a blueprint."
            actionLabel="Create project"
            actionHref="/generate"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={
                  project.status === "completed" &&
                  blueprintByProject.has(project.id)
                    ? `/blueprints/${blueprintByProject.get(project.id)}`
                    : `/studio/${project.id}`
                }
                studioHref={`/studio/${project.id}`}
                blueprintId={blueprintByProject.get(project.id) ?? null}
                showActions
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

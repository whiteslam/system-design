import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import {
  getBlueprints,
  getProjects,
  getDashboardStats,
} from "@/actions/blueprint";
import { ProjectCard } from "@/components/dashboard/project-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const [blueprints, projects, stats] = await Promise.all([
    getBlueprints(),
    getProjects(),
    getDashboardStats(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("full_name").eq("id", user.id).single()
    : { data: null };

  const firstName =
    profile?.full_name?.split(" ")[0] ??
    user?.user_metadata?.full_name?.split(" ")[0] ??
    "there";

  const recentBlueprints = blueprints.slice(0, 6);
  const recentProjects = projects.slice(0, 3);

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
        {recentBlueprints.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No blueprints yet"
            description="Generate your first system design blueprint to get started."
            actionLabel="Generate blueprint"
            actionHref="/generate"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentBlueprints.map((bp) => (
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
        {recentProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Projects are created when you generate a blueprint."
            actionLabel="Create project"
            actionHref="/generate"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={`/studio/${project.id}`}
                studioHref={`/studio/${project.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

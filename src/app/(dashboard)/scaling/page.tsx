import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { redirectToFirstProject } from "@/lib/intelligence/page-utils";

export default async function ScalingIndexPage() {
  const projects = await redirectToFirstProject("/scaling");

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Scalability Planner"
        description="Scaling strategies, cloud fit, and observability"
      />
      <ProjectPicker projects={projects} basePath="/scaling" />
    </div>
  );
}

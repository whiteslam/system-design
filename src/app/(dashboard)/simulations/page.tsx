import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { redirectToFirstProject } from "@/lib/intelligence/page-utils";

export default async function SimulationsIndexPage() {
  const projects = await redirectToFirstProject("/simulations");

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Traffic Simulation"
        description="Simulate load, bottlenecks, and service pressure"
      />
      <ProjectPicker projects={projects} basePath="/simulations" />
    </div>
  );
}

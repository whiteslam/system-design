import { getUserProjectsList, getLatestTrafficSimulation } from "@/actions/intelligence";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { IntelligenceNav } from "@/components/intelligence/intelligence-nav";
import { SimulationsPanel } from "@/features/intelligence/simulations-panel";
import type { TrafficSimulation } from "@/types/intelligence";

export default async function SimulationsProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projects, simulation] = await Promise.all([
    getUserProjectsList(),
    getLatestTrafficSimulation(projectId),
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Traffic Simulation"
        description="Visual load testing across your system design"
      />
      <ProjectPicker
        projects={projects}
        currentProjectId={projectId}
        basePath="/simulations"
      />
      <IntelligenceNav projectId={projectId} />
      <SimulationsPanel
        projectId={projectId}
        initialSimulation={simulation as TrafficSimulation | null}
      />
    </div>
  );
}

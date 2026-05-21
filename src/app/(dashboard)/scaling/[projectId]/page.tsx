import { getUserProjectsList } from "@/actions/intelligence";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { IntelligenceNav } from "@/components/intelligence/intelligence-nav";
import { ScalingPanel } from "@/features/intelligence/scaling-panel";

export default async function ScalingProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projects = await getUserProjectsList();

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Scalability Planner"
        description="Horizontal scaling, caching, queues, and cloud recommendations"
      />
      <ProjectPicker
        projects={projects}
        currentProjectId={projectId}
        basePath="/scaling"
      />
      <IntelligenceNav projectId={projectId} />
      <ScalingPanel projectId={projectId} />
    </div>
  );
}

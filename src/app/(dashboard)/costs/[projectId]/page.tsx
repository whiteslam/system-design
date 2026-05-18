import { getUserProjectsList, getLatestCostEstimation } from "@/actions/intelligence";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { IntelligenceNav } from "@/components/intelligence/intelligence-nav";
import { CostsPanel } from "@/features/intelligence/costs-panel";
import type { CostEstimation } from "@/types/intelligence";

export default async function CostsProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projects, estimation] = await Promise.all([
    getUserProjectsList(),
    getLatestCostEstimation(projectId),
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Cost Estimator"
        description="Monthly and yearly estimates across major cloud providers"
      />
      <ProjectPicker
        projects={projects}
        currentProjectId={projectId}
        basePath="/costs"
      />
      <IntelligenceNav projectId={projectId} />
      <CostsPanel
        projectId={projectId}
        initialEstimation={estimation as CostEstimation | null}
      />
    </div>
  );
}

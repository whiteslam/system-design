import { getUserProjectsList, getDeploymentConfigs } from "@/actions/intelligence";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { IntelligenceNav } from "@/components/intelligence/intelligence-nav";
import { DevOpsPanel } from "@/features/intelligence/devops-panel";
import type { DeploymentConfig } from "@/types/intelligence";

export default async function DevOpsProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projects, configs] = await Promise.all([
    getUserProjectsList(),
    getDeploymentConfigs(projectId),
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="DevOps Generator"
        description="Production deployment files tailored to your architecture"
      />
      <ProjectPicker
        projects={projects}
        currentProjectId={projectId}
        basePath="/devops"
      />
      <IntelligenceNav projectId={projectId} />
      <DevOpsPanel
        projectId={projectId}
        initialConfigs={configs as DeploymentConfig[]}
      />
    </div>
  );
}

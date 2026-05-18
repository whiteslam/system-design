import {
  getUserProjectsList,
  getLatestArchitectureReport,
} from "@/actions/intelligence";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { IntelligenceNav } from "@/components/intelligence/intelligence-nav";
import { AnalysisPanel } from "@/features/intelligence/analysis-panel";
import { InfrastructureChat } from "@/features/intelligence/infrastructure-chat";
import type { ArchitectureReport } from "@/types/intelligence";

export default async function AnalysisProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projects, report] = await Promise.all([
    getUserProjectsList(),
    getLatestArchitectureReport(projectId),
  ]);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Architecture Intelligence"
        description="AI-powered production readiness and architecture health"
      />
      <ProjectPicker
        projects={projects}
        currentProjectId={projectId}
        basePath="/analysis"
      />
      <IntelligenceNav projectId={projectId} />
      <AnalysisPanel
        projectId={projectId}
        initialReport={report as ArchitectureReport | null}
      />
      <InfrastructureChat projectId={projectId} />
    </div>
  );
}

import { getUserProjectsList, getLatestSecurityReport } from "@/actions/intelligence";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { IntelligenceNav } from "@/components/intelligence/intelligence-nav";
import { SecurityPanel } from "@/features/intelligence/security-panel";
import type { SecurityReport } from "@/types/intelligence";

export default async function SecurityProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [projects, report] = await Promise.all([
    getUserProjectsList(),
    getLatestSecurityReport(projectId),
  ]);

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Security Analyzer"
        description="Auth, API exposure, encryption, and infrastructure risks"
      />
      <ProjectPicker
        projects={projects}
        currentProjectId={projectId}
        basePath="/security"
      />
      <IntelligenceNav projectId={projectId} />
      <SecurityPanel
        projectId={projectId}
        initialReport={report as SecurityReport | null}
      />
    </div>
  );
}

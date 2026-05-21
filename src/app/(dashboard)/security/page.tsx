import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { redirectToFirstProject } from "@/lib/intelligence/page-utils";

export default async function SecurityIndexPage() {
  const projects = await redirectToFirstProject("/security");

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Security Analyzer"
        description="Vulnerability detection and remediation guidance"
      />
      <ProjectPicker projects={projects} basePath="/security" />
    </div>
  );
}

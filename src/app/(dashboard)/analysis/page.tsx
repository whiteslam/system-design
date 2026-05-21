import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { redirectToFirstProject } from "@/lib/intelligence/page-utils";

export default async function AnalysisIndexPage() {
  const projects = await redirectToFirstProject("/analysis");

  return (
    <div className="space-y-4 sm:space-y-8">
      <DashboardHeader
        title="Architecture Intelligence"
        description="Production readiness scores and AI architecture review"
      />
      <ProjectPicker projects={projects} basePath="/analysis" />
    </div>
  );
}

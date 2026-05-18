import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { redirectToFirstProject } from "@/lib/intelligence/page-utils";

export default async function CostsIndexPage() {
  const projects = await redirectToFirstProject("/costs");

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Cost Estimator"
        description="Multi-cloud infrastructure cost breakdowns"
      />
      <ProjectPicker projects={projects} basePath="/costs" />
    </div>
  );
}

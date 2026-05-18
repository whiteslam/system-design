import { DashboardHeader } from "@/components/layout/dashboard-header";
import { ProjectPicker } from "@/components/intelligence/project-picker";
import { redirectToFirstProject } from "@/lib/intelligence/page-utils";

export default async function DevOpsIndexPage() {
  const projects = await redirectToFirstProject("/devops");

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="DevOps Generator"
        description="Docker, Kubernetes, CI/CD, and Terraform configs"
      />
      <ProjectPicker projects={projects} basePath="/devops" />
    </div>
  );
}

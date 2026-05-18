import { notFound, redirect } from "next/navigation";
import { getOrCreateDiagram, getProjectForStudio } from "@/actions/diagram";
import { StudioWorkspace } from "@/features/studio/studio-workspace";

interface StudioPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function StudioPage({ params }: StudioPageProps) {
  const { projectId } = await params;
  const ctx = await getProjectForStudio(projectId);

  if (!ctx) {
    redirect("/login");
  }

  const diagram = await getOrCreateDiagram(projectId);
  if (!diagram) {
    notFound();
  }

  return (
    <StudioWorkspace
      projectId={projectId}
      projectName={ctx.project.name}
      diagram={diagram}
    />
  );
}

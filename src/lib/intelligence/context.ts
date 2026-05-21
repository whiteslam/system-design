import { createClient } from "@/lib/supabase/server";
import type { ProjectIntelligenceContext } from "@/types/intelligence";

export async function buildProjectIntelligenceContext(
  projectId: string
): Promise<ProjectIntelligenceContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, name, description, features, expected_users, budget, preferred_stack, scale"
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return null;

  const { data: blueprint } = await supabase
    .from("blueprints")
    .select(
      "overview, architecture, security_plan, deployment_plan, scaling_strategy"
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: diagram } = await supabase
    .from("diagrams")
    .select("diagram_json")
    .eq("project_id", projectId)
    .maybeSingle();

  const diagramJson = diagram?.diagram_json as {
    nodes?: { id: string; type?: string; data?: { label?: string } }[];
    edges?: { source: string; target: string; type?: string }[];
  } | null;

  return {
    project: {
      name: project.name,
      description: project.description,
      features: project.features ?? [],
      expected_users: project.expected_users ?? project.scale,
      budget: project.budget,
      preferred_stack: project.preferred_stack,
      scale: project.scale,
    },
    blueprint: blueprint ?? undefined,
    diagram: diagramJson?.nodes
      ? {
          nodes: diagramJson.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            label: n.data?.label ?? n.id,
          })),
          edges: (diagramJson.edges ?? []).map((e) => ({
            source: e.source,
            target: e.target,
            type: e.type,
          })),
        }
      : undefined,
  };
}

export function formatContextForPrompt(ctx: ProjectIntelligenceContext): string {
  const parts = [
    `Project: ${ctx.project.name}`,
    `Description: ${ctx.project.description ?? "N/A"}`,
    `Features: ${ctx.project.features.join(", ") || "N/A"}`,
    `Expected users: ${ctx.project.expected_users ?? "N/A"}`,
    `Budget: ${ctx.project.budget ?? "N/A"}`,
    `Stack: ${ctx.project.preferred_stack ?? "N/A"}`,
  ];

  if (ctx.blueprint?.architecture) {
    parts.push(`\nArchitecture blueprint:\n${ctx.blueprint.architecture.slice(0, 4000)}`);
  }
  if (ctx.diagram?.nodes.length) {
    parts.push(
      `\nDiagram services: ${ctx.diagram.nodes.map((n) => `${n.label} (${n.type})`).join(", ")}`
    );
    parts.push(
      `Connections: ${ctx.diagram.edges.map((e) => `${e.source}->${e.target}`).join(", ")}`
    );
  }

  return parts.join("\n");
}

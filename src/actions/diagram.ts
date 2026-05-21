"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateDiagramFromAI } from "@/services/ai/diagram-generator";
import { implementSuggestionWithAI } from "@/services/ai/implement-suggestion";
import {
  fixAllHealthWarningsWithAI,
  fixHealthWarningWithAI,
} from "@/services/ai/fix-health-warnings";
import type { DiagramJson } from "@/types/diagram";
import type { SuggestionImplementationResult } from "@/types/suggestion-implementation";
import { enforceAiRateLimit } from "@/lib/security/ai-rate-limit";

export type DiagramActionResult = {
  error?: string;
  success?: boolean;
  diagram?: DiagramJson;
  suggestions?: string[];
  healthWarnings?: string[];
};

export async function getOrCreateDiagram(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return null;

  const { data: existing } = await supabase
    .from("diagrams")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (existing) return existing;

  const emptyDiagram: DiagramJson = {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };

  const { data: created, error } = await supabase
    .from("diagrams")
    .insert({
      project_id: projectId,
      user_id: user.id,
      title: `${project.name} — Architecture`,
      diagram_json: emptyDiagram,
    })
    .select("*")
    .single();

  if (error) return null;
  return created;
}

export async function getProjectForStudio(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return null;

  const { data: blueprint } = await supabase
    .from("blueprints")
    .select("architecture, overview")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { project, blueprint };
}

export async function saveDiagramAction(
  diagramId: string,
  diagramJson: DiagramJson,
  title?: string,
  options?: { light?: boolean }
): Promise<DiagramActionResult> {
  const supabase = await createClient();
  if (!supabase) return { error: "Service unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: diagram } = await supabase
    .from("diagrams")
    .select("id, project_id")
    .eq("id", diagramId)
    .eq("user_id", user.id)
    .single();

  if (!diagram) return { error: "Diagram not found" };

  const { error } = await supabase
    .from("diagrams")
    .update({
      diagram_json: diagramJson,
      ...(title ? { title } : {}),
    })
    .eq("id", diagramId);

  if (error) return { error: error.message };

  if (!options?.light) {
    await syncNormalizedNodes(supabase, diagramId, diagramJson);
    revalidatePath(`/studio/${diagram.project_id}`);
  }

  return { success: true };
}

async function syncNormalizedNodes(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  diagramId: string,
  diagramJson: DiagramJson
) {
  await supabase.from("diagram_nodes").delete().eq("diagram_id", diagramId);
  await supabase.from("diagram_edges").delete().eq("diagram_id", diagramId);

  if (diagramJson.nodes.length > 0) {
    await supabase.from("diagram_nodes").insert(
      diagramJson.nodes.map((n) => ({
        diagram_id: diagramId,
        node_id: n.id,
        node_type: n.type ?? "api",
        position_x: n.position.x,
        position_y: n.position.y,
        metadata: n.data,
      }))
    );
  }

  if (diagramJson.edges.length > 0) {
    await supabase.from("diagram_edges").insert(
      diagramJson.edges.map((e) => ({
        diagram_id: diagramId,
        edge_id: e.id,
        source_node: e.source,
        target_node: e.target,
        edge_type: e.type ?? "api",
        metadata: e.data ?? {},
      }))
    );
  }
}

export async function implementSuggestionAction(
  suggestion: string,
  diagramJson: DiagramJson,
  suggestions: string[],
  healthWarnings: string[]
): Promise<
  | { error: string }
  | { success: true; implementation: SuggestionImplementationResult }
> {
  const supabase = await createClient();
  if (!supabase) return { error: "Service unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limited = enforceAiRateLimit(user.id, "implement-suggestion");
  if (!limited.ok) return { error: limited.error };

  if (!suggestion.trim()) {
    return { error: "Suggestion is required" };
  }

  try {
    const implementation = await implementSuggestionWithAI(
      diagramJson,
      suggestion,
      suggestions,
      healthWarnings
    );
    return { success: true, implementation };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to implement suggestion",
    };
  }
}

export async function fixHealthWarningAction(
  healthWarning: string,
  diagramJson: DiagramJson,
  suggestions: string[],
  healthWarnings: string[]
): Promise<
  | { error: string }
  | { success: true; implementation: SuggestionImplementationResult }
> {
  const supabase = await createClient();
  if (!supabase) return { error: "Service unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limited = enforceAiRateLimit(user.id, "implement-suggestion");
  if (!limited.ok) return { error: limited.error };

  if (!healthWarning.trim()) {
    return { error: "Health warning is required" };
  }

  try {
    const implementation = await fixHealthWarningWithAI(
      diagramJson,
      healthWarning,
      healthWarnings,
      suggestions
    );
    return { success: true, implementation };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to fix health warning",
    };
  }
}

export async function fixAllHealthWarningsAction(
  diagramJson: DiagramJson,
  suggestions: string[],
  healthWarnings: string[]
): Promise<
  | { error: string }
  | { success: true; implementation: SuggestionImplementationResult }
> {
  const supabase = await createClient();
  if (!supabase) return { error: "Service unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limitedAll = enforceAiRateLimit(user.id, "implement-suggestion");
  if (!limitedAll.ok) return { error: limitedAll.error };

  if (healthWarnings.length === 0) {
    return { error: "No health warnings to fix" };
  }

  try {
    const implementation = await fixAllHealthWarningsWithAI(
      diagramJson,
      healthWarnings,
      suggestions
    );
    return { success: true, implementation };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Failed to fix architecture health",
    };
  }
}

export async function generateArchitectureDiagramAction(
  projectId: string
): Promise<DiagramActionResult> {
  const supabase = await createClient();
  if (!supabase) return { error: "Service unavailable" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limitedDiagram = enforceAiRateLimit(user.id, "diagram-ai");
  if (!limitedDiagram.ok) return { error: limitedDiagram.error };

  const ctx = await getProjectForStudio(projectId);
  if (!ctx) return { error: "Project not found" };

  const diagramRecord = await getOrCreateDiagram(projectId);
  if (!diagramRecord) return { error: "Failed to load diagram" };

  try {
    const result = await generateDiagramFromAI({
      projectName: ctx.project.name,
      projectDescription: ctx.project.description,
      features: ctx.project.features,
      preferredStack: ctx.project.preferred_stack,
      expectedUsers: ctx.project.expected_users ?? ctx.project.scale,
      architecture: ctx.blueprint?.architecture ?? ctx.blueprint?.overview,
    });

    await saveDiagramAction(diagramRecord.id, result.diagram, result.title);

    return {
      success: true,
      diagram: result.diagram,
      suggestions: result.suggestions,
      healthWarnings: result.healthWarnings,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "AI generation failed",
    };
  }
}

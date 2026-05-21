"use server";

import { revalidatePath } from "next/cache";
import { createClient, SUPABASE_NOT_CONFIGURED_MSG } from "@/lib/supabase/server";
import { generateBlueprint } from "@/services/ai/openai";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import type { GenerateBlueprintInput, Project } from "@/types";

export type ProjectActionResult = {
  error?: string;
  blueprintId?: string;
};

function projectToInput(project: Project): GenerateBlueprintInput {
  return {
    projectName: project.name,
    projectDescription: project.description ?? "",
    features: Array.isArray(project.features) ? project.features : [],
    expectedUsers: project.expected_users ?? project.scale ?? "",
    budget: project.budget ?? "",
    preferredStack: project.preferred_stack ?? "",
    authType: project.auth_type ?? "",
    realtimeRequirements: project.realtime_requirements ?? "",
    fileUploadNeeds: project.file_upload_needs ?? "",
    aiFeatures: project.ai_features ?? "",
    deploymentPreference: project.deployment_preference ?? "",
  };
}

function formatAiError(message: string): string {
  if (message.includes("OPENROUTER_API_KEY")) {
    return "AI is not configured. Add OPENROUTER_API_KEY to .env.local and restart the server.";
  }
  return message;
}

async function runGenerationForProject(
  projectId: string
): Promise<ProjectActionResult> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_MSG };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const rateLimitResult = rateLimit(
    getRateLimitKey(user.id, "generate-blueprint"),
    { limit: 10, windowSec: 3600 }
  );

  if (!rateLimitResult.success) {
    const resetMinutes = Math.ceil(
      (rateLimitResult.resetAt - Date.now()) / 60000
    );
    return {
      error: `Rate limit exceeded. Try again in ${resetMinutes} minutes.`,
    };
  }

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !project) {
    return { error: "Project not found" };
  }

  if (project.status === "generating") {
    return { error: "This project is already generating" };
  }

  const input = projectToInput(project as Project);

  await supabase
    .from("projects")
    .update({ status: "generating" })
    .eq("id", projectId);

  const { data: generation } = await supabase
    .from("ai_generations")
    .insert({
      user_id: user.id,
      project_id: projectId,
      status: "processing",
    })
    .select("id")
    .single();

  try {
    const { content, usage } = await generateBlueprint(input);

    const { data: existingBlueprint } = await supabase
      .from("blueprints")
      .select("id")
      .eq("project_id", projectId)
      .maybeSingle();

    const blueprintPayload = {
      project_id: projectId,
      user_id: user.id,
      title: `${input.projectName} — System Blueprint`,
      overview: content.overview,
      architecture: content.architecture,
      database_design: content.database,
      api_design: content.apis,
      security_plan: content.security,
      deployment_plan: content.deployment,
      scaling_strategy: content.scaling,
      recommended_stack: content.recommendedStack,
      folder_structure: content.folderStructure,
      tech_stack_reasoning: content.techStackReasoning,
      raw_content: content,
    };

    let blueprintId: string;

    if (existingBlueprint) {
      const { data: updated, error: updateError } = await supabase
        .from("blueprints")
        .update(blueprintPayload)
        .eq("id", existingBlueprint.id)
        .select("id")
        .single();

      if (updateError || !updated) {
        throw new Error(updateError?.message ?? "Failed to update blueprint");
      }
      blueprintId = updated.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("blueprints")
        .insert(blueprintPayload)
        .select("id")
        .single();

      if (insertError || !inserted) {
        throw new Error(insertError?.message ?? "Failed to save blueprint");
      }
      blueprintId = inserted.id;
    }

    await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", projectId);

    if (generation) {
      await supabase
        .from("ai_generations")
        .update({
          status: "completed",
          blueprint_id: blueprintId,
          prompt_tokens: usage.prompt,
          completion_tokens: usage.completion,
        })
        .eq("id", generation.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { blueprintId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate blueprint";

    await supabase
      .from("projects")
      .update({ status: "failed" })
      .eq("id", projectId);

    if (generation) {
      await supabase
        .from("ai_generations")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", generation.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { error: formatAiError(message) };
  }
}

export async function retryProjectBlueprintAction(
  projectId: string
): Promise<ProjectActionResult> {
  return runGenerationForProject(projectId);
}

export async function deleteProjectAction(
  projectId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_MSG };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return {};
}

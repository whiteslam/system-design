"use server";

import { revalidatePath } from "next/cache";
import { createClient, SUPABASE_NOT_CONFIGURED_MSG } from "@/lib/supabase/server";
import { generateSchema } from "@/lib/validations/generate";
import { generateBlueprint } from "@/services/ai/openai";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import type { Blueprint, GenerateBlueprintInput, Project } from "@/types";

export type GenerateActionState = {
  error?: string;
  blueprintId?: string;
};

export async function generateBlueprintAction(
  _prev: GenerateActionState,
  formData: FormData
): Promise<GenerateActionState> {
  const featuresRaw = formData.get("features");
  const features =
    typeof featuresRaw === "string" ? JSON.parse(featuresRaw) : [];

  const str = (key: string) => {
    const v = formData.get(key);
    return v == null ? "" : String(v);
  };
  const optStr = (key: string) => {
    const v = formData.get(key);
    if (v == null || v === "") return undefined;
    return String(v);
  };
  const complexityRaw = formData.get("complexityLevel");
  const complexityLevel =
    complexityRaw == null || complexityRaw === ""
      ? undefined
      : Number(complexityRaw);

  const parsed = generateSchema.safeParse({
    projectName: str("projectName"),
    projectDescription: str("projectDescription"),
    features,
    expectedUsers: str("expectedUsers"),
    budget: str("budget"),
    preferredStack: str("preferredStack"),
    authType: str("authType"),
    realtimeRequirements: optStr("realtimeRequirements"),
    fileUploadNeeds: optStr("fileUploadNeeds"),
    aiFeatures: optStr("aiFeatures"),
    deploymentPreference: str("deploymentPreference"),
    complexityLevel,
    needsRealtime: formData.get("needsRealtime") === "true",
    needsFileUpload: formData.get("needsFileUpload") === "true",
    needsAi: formData.get("needsAi") === "true",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const message =
      first?.message ??
      (first?.path.length
        ? `Invalid ${String(first.path[0])}`
        : "Invalid input");
    return { error: message };
  }

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

  const input: GenerateBlueprintInput = {
    projectName: parsed.data.projectName,
    projectDescription: parsed.data.projectDescription,
    features: parsed.data.features,
    expectedUsers: parsed.data.expectedUsers,
    budget: parsed.data.budget,
    preferredStack: parsed.data.preferredStack,
    authType: parsed.data.authType,
    realtimeRequirements: parsed.data.realtimeRequirements ?? "",
    fileUploadNeeds: parsed.data.fileUploadNeeds ?? "",
    aiFeatures: parsed.data.aiFeatures ?? "",
    deploymentPreference: parsed.data.deploymentPreference,
    complexityLevel: parsed.data.complexityLevel,
  };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: input.projectName,
      description: input.projectDescription,
      features: input.features,
      expected_users: input.expectedUsers,
      budget: input.budget,
      preferred_stack: input.preferredStack,
      auth_type: input.authType,
      realtime_requirements: input.realtimeRequirements,
      file_upload_needs: input.fileUploadNeeds,
      ai_features: input.aiFeatures,
      deployment_preference: input.deploymentPreference,
      scale: input.expectedUsers,
      status: "generating",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return { error: projectError?.message ?? "Failed to create project" };
  }

  const { data: generation } = await supabase
    .from("ai_generations")
    .insert({
      user_id: user.id,
      project_id: project.id,
      status: "processing",
    })
    .select("id")
    .single();

  try {
    const { content, usage } = await generateBlueprint(input);

    const { data: blueprint, error: blueprintError } = await supabase
      .from("blueprints")
      .insert({
        project_id: project.id,
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
      })
      .select("id")
      .single();

    if (blueprintError || !blueprint) {
      throw new Error(blueprintError?.message ?? "Failed to save blueprint");
    }

    await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", project.id);

    if (generation) {
      await supabase
        .from("ai_generations")
        .update({
          status: "completed",
          blueprint_id: blueprint.id,
          prompt_tokens: usage.prompt,
          completion_tokens: usage.completion,
        })
        .eq("id", generation.id);
    }

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return { blueprintId: blueprint.id };
  } catch (err) {
    await supabase
      .from("projects")
      .update({ status: "failed" })
      .eq("id", project.id);

    if (generation) {
      await supabase
        .from("ai_generations")
        .update({
          status: "failed",
          error_message: err instanceof Error ? err.message : "Unknown error",
        })
        .eq("id", generation.id);
    }

    return {
      error:
        err instanceof Error ? err.message : "Failed to generate blueprint",
    };
  }
}

export async function getBlueprints(): Promise<Blueprint[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("blueprints")
    .select("*, projects(name, preferred_stack, scale, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Blueprint[];
}

export async function getBlueprint(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("blueprints")
    .select("*, projects(name, preferred_stack, scale, status)")
    .eq("id", id)
    .single();

  return data;
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Project[];
}

export async function getDashboardStats() {
  const supabase = await createClient();
  if (!supabase) {
    return { projects: 0, blueprints: 0, completed: 0 };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { projects: 0, blueprints: 0, completed: 0 };
  }

  const [projectsRes, blueprintsRes, completedRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("blueprints")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed"),
  ]);

  return {
    projects: projectsRes.count ?? 0,
    blueprints: blueprintsRes.count ?? 0,
    completed: completedRes.count ?? 0,
  };
}

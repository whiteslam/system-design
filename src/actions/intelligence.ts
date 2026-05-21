"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildProjectIntelligenceContext } from "@/lib/intelligence/context";
import { normalizeTrafficSimulationResults } from "@/lib/intelligence/normalize-traffic";
import {
  generateArchitectureAnalysis,
  generateSecurityReport,
  generateCostEstimation,
  generateTrafficSimulation,
  generateScalabilityPlan,
  generateCloudRecommendation,
  generateObservabilityPlan,
  generateDeploymentConfig,
  answerInfrastructureQuestion,
} from "@/services/ai/intelligence/engine";
import {
  fixTrafficSimulationWithAI,
  getUnhealthyServiceIds,
} from "@/services/ai/intelligence/fix-traffic-simulation";
import { enforceAiRateLimit } from "@/lib/security/ai-rate-limit";
import type {
  DeploymentConfigType,
  ServiceLoadMetric,
  TrafficSimulation,
} from "@/types/intelligence";

export type ActionResult<T = unknown> = {
  error?: string;
  data?: T;
  filename?: string;
};

function checkAiRateLimit(
  userId: string,
  action: string
): { error: string } | null {
  const result = enforceAiRateLimit(userId, action);
  if (!result.ok) return { error: result.error };
  return null;
}

async function getUserProject(projectId: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Unauthorized" as const, user: null, supabase: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" as const, user: null, supabase };

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return { error: "Project not found" as const, user: null, supabase };
  return { error: null, user, supabase };
}

export async function getUserProjectsList() {
  const supabase = await createClient();
  if (!supabase) return [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("projects")
    .select("id, name, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function runArchitectureAnalysis(
  projectId: string
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-analysis");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  try {
    const result = await generateArchitectureAnalysis(ctx);
    const { data, error } = await auth.supabase
      .from("architecture_reports")
      .insert({
        project_id: projectId,
        user_id: auth.user.id,
        overall_score: result.overall_score,
        scalability_score: result.scalability_score,
        reliability_score: result.reliability_score,
        security_score: result.security_score,
        performance_score: result.performance_score,
        maintainability_score: result.maintainability_score,
        cost_efficiency_score: result.cost_efficiency_score,
        availability_score: result.availability_score,
        devops_readiness_score: result.devops_readiness_score,
        recommendations: result.recommendations,
        category_insights: result.category_insights,
        warnings: result.warnings,
      })
      .select("*")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/analysis/${projectId}`);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Analysis failed" };
  }
}

export async function getLatestArchitectureReport(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("architecture_reports")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function runSecurityAnalysis(
  projectId: string
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-security");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  try {
    const result = await generateSecurityReport(ctx);
    const { data, error } = await auth.supabase
      .from("security_reports")
      .insert({
        project_id: projectId,
        user_id: auth.user.id,
        vulnerabilities: result.vulnerabilities,
        severity_summary: result.severity_summary,
        recommendations: result.recommendations,
        overall_risk: result.overall_risk,
      })
      .select("*")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/security/${projectId}`);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Security analysis failed" };
  }
}

export async function getLatestSecurityReport(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("security_reports")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function runCostEstimation(
  projectId: string,
  provider: string
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-cost");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  try {
    const result = await generateCostEstimation(ctx, provider);
    const { data, error } = await auth.supabase
      .from("cost_estimations")
      .insert({
        project_id: projectId,
        user_id: auth.user.id,
        provider,
        estimated_monthly_cost: result.estimated_monthly_cost,
        estimated_yearly_cost: result.estimated_yearly_cost,
        breakdown_json: { items: result.breakdown },
        optimizations: result.optimizations,
      })
      .select("*")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/costs/${projectId}`);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cost estimation failed" };
  }
}

export async function getLatestCostEstimation(projectId: string, provider?: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  let query = supabase
    .from("cost_estimations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1);
  if (provider) query = query.eq("provider", provider);
  const { data } = await query.maybeSingle();
  return data;
}

export async function runTrafficSimulation(
  projectId: string,
  concurrentUsers: number
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-simulation");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  try {
    const result = await generateTrafficSimulation(ctx, concurrentUsers);
    const diagramServices = ctx.diagram?.nodes.map((n) => n.label) ?? [];
    const normalized = normalizeTrafficSimulationResults(
      {
        services: result.services,
        summary: result.summary,
        accuracy_rate: result.accuracy_rate,
      },
      { concurrentUsers, diagramServices }
    );
    const bottlenecks = Array.isArray(result.bottlenecks)
      ? result.bottlenecks.map(String)
      : [];

    const { data, error } = await auth.supabase
      .from("traffic_simulations")
      .insert({
        project_id: projectId,
        user_id: auth.user.id,
        concurrent_users: concurrentUsers,
        bottlenecks,
        simulation_results: normalized,
      })
      .select("*")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/simulations/${projectId}`);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Simulation failed" };
  }
}

export async function fixTrafficSimulationAction(
  projectId: string,
  simulationId: string,
  serviceId?: string
): Promise<ActionResult<TrafficSimulation & { fixSummary?: string }>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };

  const { data: row, error: fetchError } = await auth.supabase
    .from("traffic_simulations")
    .select("*")
    .eq("id", simulationId)
    .eq("project_id", projectId)
    .eq("user_id", auth.user.id)
    .single();

  if (fetchError || !row) {
    return { error: "Simulation not found" };
  }

  const normalized = normalizeTrafficSimulationResults(row.simulation_results, {
    concurrentUsers: row.concurrent_users,
  });

  const unhealthyIds = getUnhealthyServiceIds(normalized.services);
  if (unhealthyIds.length === 0) {
    return { error: "All services are already healthy" };
  }

  const targetIds = serviceId
    ? normalized.services
        .filter(
          (s) => s.serviceId === serviceId || s.serviceName === serviceId
        )
        .map((s) => s.serviceId)
    : unhealthyIds;

  if (serviceId && targetIds.length === 0) {
    return { error: "Service not found in this simulation" };
  }

  const limited = checkAiRateLimit(auth.user.id, "intelligence-simulation");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  const bottlenecks = Array.isArray(row.bottlenecks)
    ? (row.bottlenecks as string[]).map(String)
    : [];

  try {
    const fixed = await fixTrafficSimulationWithAI(
      ctx,
      row.concurrent_users,
      normalized.services,
      bottlenecks,
      normalized.summary,
      targetIds
    );

    const { data, error } = await auth.supabase
      .from("traffic_simulations")
      .update({
        simulation_results: {
          services: fixed.services,
          summary: fixed.summary,
          accuracyRate: fixed.accuracyRate,
        },
        bottlenecks: fixed.services.every(
          (s: ServiceLoadMetric) =>
            s.status === "healthy"
        )
          ? []
          : bottlenecks.filter((b) =>
              targetIds.every(
                (id) =>
                  !b
                    .toLowerCase()
                    .includes(
                      normalized.services
                        .find((s) => s.serviceId === id)
                        ?.serviceName.toLowerCase() ?? ""
                    )
              )
            ),
      })
      .eq("id", simulationId)
      .select("*")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/simulations/${projectId}`);
    return {
      data: { ...(data as TrafficSimulation), fixSummary: fixed.fixSummary },
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Failed to fix simulation",
    };
  }
}

export async function getLatestTrafficSimulation(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("traffic_simulations")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function runScalabilityPlan(
  projectId: string
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-analysis");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };
  try {
    const data = await generateScalabilityPlan(ctx);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function runCloudRecommendation(
  projectId: string
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-analysis");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };
  try {
    const data = await generateCloudRecommendation(ctx);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function runObservabilityPlan(
  projectId: string
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-analysis");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };
  try {
    const data = await generateObservabilityPlan(ctx);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function runDeploymentConfig(
  projectId: string,
  configType: DeploymentConfigType
): Promise<ActionResult<unknown>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-devops");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  try {
    const result = await generateDeploymentConfig(ctx, configType);
    const { data, error } = await auth.supabase
      .from("deployment_configs")
      .insert({
        project_id: projectId,
        user_id: auth.user.id,
        config_type: configType,
        generated_code: result.code,
      })
      .select("*")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/devops/${projectId}`);
    return { data, filename: result.filename };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function getDeploymentConfigs(projectId: string) {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("deployment_configs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function askInfrastructureChat(
  projectId: string,
  question: string
): Promise<ActionResult<string>> {
  const auth = await getUserProject(projectId);
  if (auth.error || !auth.user) return { error: auth.error ?? "Unauthorized" };
  const limited = checkAiRateLimit(auth.user.id, "intelligence-chat");
  if (limited) return limited;

  const ctx = await buildProjectIntelligenceContext(projectId);
  if (!ctx) return { error: "Could not load project context" };

  try {
    const answer = await answerInfrastructureQuestion(ctx, question);
    return { data: answer };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Chat failed" };
  }
}

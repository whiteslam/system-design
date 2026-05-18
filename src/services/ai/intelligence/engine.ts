import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import { formatContextForPrompt } from "@/lib/intelligence/context";
import type { ProjectIntelligenceContext } from "@/types/intelligence";

async function callIntelligenceAI<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const client = getOpenRouterClient();
  const response = await client.chat.completions.create({
    model: getOpenRouterModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 6000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No AI response");
  return JSON.parse(raw) as T;
}

const ENGINEER_PERSONA = `You are a Principal Engineer, Cloud Architect, SRE, DevOps Lead, and Security Consultant combined. Be specific, cite the actual architecture, explain tradeoffs, avoid generic advice. Output valid JSON only.`;

export async function generateArchitectureAnalysis(
  ctx: ProjectIntelligenceContext
) {
  return callIntelligenceAI<{
    overall_score: number;
    scalability_score: number;
    reliability_score: number;
    security_score: number;
    performance_score: number;
    maintainability_score: number;
    cost_efficiency_score: number;
    availability_score: number;
    devops_readiness_score: number;
    recommendations: string[];
    category_insights: Record<
      string,
      { score: number; explanation: string; recommendations: string[] }
    >;
    warnings: { message: string; category: string; severity: string }[];
  }>(
    ENGINEER_PERSONA,
    `Analyze architecture health. Context:\n${formatContextForPrompt(ctx)}\n\nReturn JSON with scores 0-100 for each category, category_insights (scalability, reliability, security, performance, maintainability, cost_efficiency, availability, devops_readiness), recommendations array, warnings with severity low|medium|high|critical.`
  );
}

export async function generateSecurityReport(ctx: ProjectIntelligenceContext) {
  return callIntelligenceAI<{
    vulnerabilities: {
      title: string;
      description: string;
      severity: string;
      remediation: string;
    }[];
    severity_summary: Record<string, number>;
    recommendations: string[];
    overall_risk: string;
  }>(
    ENGINEER_PERSONA,
    `Security audit. Context:\n${formatContextForPrompt(ctx)}\n\nReturn vulnerabilities[], severity_summary counts, recommendations[], overall_risk low|medium|high|critical.`
  );
}

export async function generateCostEstimation(
  ctx: ProjectIntelligenceContext,
  provider: string
) {
  return callIntelligenceAI<{
    estimated_monthly_cost: number;
    estimated_yearly_cost: number;
    breakdown: { category: string; monthly: number; description?: string }[];
    optimizations: string[];
  }>(
    ENGINEER_PERSONA,
    `Estimate ${provider} infrastructure costs in USD. Context:\n${formatContextForPrompt(ctx)}\n\nReturn realistic monthly/yearly costs and breakdown by compute, storage, bandwidth, database, CDN, caching.`
  );
}

export async function generateTrafficSimulation(
  ctx: ProjectIntelligenceContext,
  concurrentUsers: number
) {
  return callIntelligenceAI<{
    services: {
      serviceId: string;
      serviceName: string;
      cpu: number;
      memory: number;
      dbLoad?: number;
      queuePressure?: number;
      networkMbps?: number;
      status: string;
    }[];
    bottlenecks: string[];
    summary: string;
  }>(
    ENGINEER_PERSONA,
    `Simulate ${concurrentUsers} concurrent users. Context:\n${formatContextForPrompt(ctx)}\n\nReturn per-service metrics 0-100, status healthy|warning|critical, bottlenecks[], summary.`
  );
}

export async function generateScalabilityPlan(ctx: ProjectIntelligenceContext) {
  return callIntelligenceAI<{
    strategies: {
      title: string;
      description: string;
      priority: string;
      category: string;
    }[];
    summary: string;
  }>(
    ENGINEER_PERSONA,
    `Scalability plan: horizontal/vertical scaling, load balancing, sharding, replication, Redis, queues, CDN, autoscaling. Context:\n${formatContextForPrompt(ctx)}`
  );
}

export async function generateCloudRecommendation(
  ctx: ProjectIntelligenceContext
) {
  return callIntelligenceAI<{
    primary: string;
    alternatives: string[];
    reasoning: string;
    tradeoffs: string[];
  }>(
    ENGINEER_PERSONA,
    `Recommend cloud stack among AWS, Vercel, GCP, Azure, Supabase, Cloudflare. Context:\n${formatContextForPrompt(ctx)}`
  );
}

export async function generateObservabilityPlan(
  ctx: ProjectIntelligenceContext
) {
  return callIntelligenceAI<{
    tools: { name: string; purpose: string }[];
    loggingPipeline: string;
    metricsFlow: string;
    recommendations: string[];
  }>(
    ENGINEER_PERSONA,
    `Observability: Prometheus, Grafana, Sentry, OpenTelemetry, logging. Context:\n${formatContextForPrompt(ctx)}`
  );
}

export async function generateDeploymentConfig(
  ctx: ProjectIntelligenceContext,
  configType: string
) {
  return callIntelligenceAI<{ code: string; filename: string }>(
    `${ENGINEER_PERSONA} Generate production-ready ${configType} with comments.`,
    `Generate ${configType} for:\n${formatContextForPrompt(ctx)}\n\nReturn JSON: { "code": "full file content", "filename": "suggested filename" }`
  );
}

export async function answerInfrastructureQuestion(
  ctx: ProjectIntelligenceContext,
  question: string
) {
  const client = getOpenRouterClient();
  const response = await client.chat.completions.create({
    model: getOpenRouterModel(),
    messages: [
      {
        role: "system",
        content: `${ENGINEER_PERSONA} Answer as Staff Engineer. Use markdown.`,
      },
      {
        role: "user",
        content: `Context:\n${formatContextForPrompt(ctx)}\n\nQuestion: ${question}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content ?? "No response";
}

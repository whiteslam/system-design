export type Severity = "low" | "medium" | "high" | "critical";

export interface IntelligenceWarning {
  message: string;
  category: string;
  severity: Severity;
}

export interface CategoryInsight {
  score: number;
  explanation: string;
  recommendations: string[];
}

export interface ArchitectureReport {
  id: string;
  project_id: string;
  user_id: string;
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
  category_insights: Record<string, CategoryInsight>;
  warnings: IntelligenceWarning[];
  created_at: string;
  updated_at: string;
}

export interface SecurityVulnerability {
  title: string;
  description: string;
  severity: Severity;
  remediation: string;
}

export interface SecurityReport {
  id: string;
  project_id: string;
  user_id: string;
  vulnerabilities: SecurityVulnerability[];
  severity_summary: Record<Severity, number>;
  recommendations: string[];
  overall_risk: string;
  created_at: string;
}

export interface CostBreakdownItem {
  category: string;
  monthly: number;
  description?: string;
}

export interface CostEstimation {
  id: string;
  project_id: string;
  user_id: string;
  provider: string;
  estimated_monthly_cost: number;
  estimated_yearly_cost: number;
  breakdown_json: { items: CostBreakdownItem[] };
  optimizations: string[];
  created_at: string;
}

export interface ServiceLoadMetric {
  serviceId: string;
  serviceName: string;
  cpu: number;
  memory: number;
  dbLoad?: number;
  queuePressure?: number;
  networkMbps?: number;
  status: "healthy" | "warning" | "critical";
}

export interface TrafficSimulation {
  id: string;
  project_id: string;
  user_id: string;
  concurrent_users: number;
  bottlenecks: string[];
  simulation_results: {
    services: ServiceLoadMetric[];
    summary: string;
    accuracyRate?: number;
  };
  created_at: string;
}

export type DeploymentConfigType =
  | "dockerfile"
  | "docker-compose"
  | "kubernetes"
  | "github-actions"
  | "nginx"
  | "terraform";

export interface DeploymentConfig {
  id: string;
  project_id: string;
  user_id: string;
  config_type: DeploymentConfigType;
  generated_code: string;
  created_at: string;
}

export interface CloudRecommendation {
  primary: string;
  alternatives: string[];
  reasoning: string;
  tradeoffs: string[];
}

export interface ScalabilityPlan {
  strategies: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: string;
  }[];
  summary: string;
}

export interface ObservabilityPlan {
  tools: { name: string; purpose: string }[];
  loggingPipeline: string;
  metricsFlow: string;
  recommendations: string[];
}

export interface ProjectIntelligenceContext {
  project: {
    name: string;
    description: string | null;
    features: string[];
    expected_users: string | null;
    budget: string | null;
    preferred_stack: string | null;
    scale: string | null;
  };
  blueprint?: {
    overview: string | null;
    architecture: string | null;
    security_plan: string | null;
    deployment_plan: string | null;
    scaling_strategy: string | null;
  };
  diagram?: {
    nodes: { id: string; type?: string; label: string }[];
    edges: { source: string; target: string; type?: string }[];
  };
}

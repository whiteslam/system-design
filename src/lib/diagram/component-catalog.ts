import type { StudioNodeType } from "@/types/diagram";

export type ComponentCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "Cache"
  | "Queue"
  | "CDN"
  | "AI Services"
  | "Storage"
  | "Monitoring"
  | "Security"
  | "DevOps";

export interface CatalogComponent {
  id: string;
  label: string;
  type: StudioNodeType;
  category: ComponentCategory;
  icon: string;
  color: string;
  description: string;
}

export const COMPONENT_CATALOG: CatalogComponent[] = [
  { id: "nextjs", label: "Next.js", type: "frontend", category: "Frontend", icon: "▲", color: "#ffffff", description: "React framework" },
  { id: "react", label: "React", type: "frontend", category: "Frontend", icon: "⚛", color: "#61dafb", description: "UI library" },
  { id: "vercel", label: "Vercel Edge", type: "cdn", category: "CDN", icon: "▲", color: "#000000", description: "Edge network" },
  { id: "cloudflare", label: "Cloudflare", type: "cdn", category: "CDN", icon: "☁", color: "#f38020", description: "CDN & WAF" },
  { id: "api-gateway", label: "API Gateway", type: "api", category: "Backend", icon: "⬡", color: "#8b5cf6", description: "API routing layer" },
  { id: "nodejs", label: "Node.js API", type: "api", category: "Backend", icon: "◆", color: "#68a063", description: "REST/GraphQL service" },
  { id: "fastapi", label: "FastAPI", type: "api", category: "Backend", icon: "⚡", color: "#009688", description: "Python API" },
  { id: "postgresql", label: "PostgreSQL", type: "database", category: "Database", icon: "🐘", color: "#336791", description: "Primary database" },
  { id: "supabase", label: "Supabase", type: "database", category: "Database", icon: "⚡", color: "#3ecf8e", description: "Postgres + Auth" },
  { id: "mongodb", label: "MongoDB", type: "database", category: "Database", icon: "🍃", color: "#47a248", description: "Document store" },
  { id: "redis", label: "Redis", type: "cache", category: "Cache", icon: "◉", color: "#dc382d", description: "In-memory cache" },
  { id: "kafka", label: "Kafka", type: "queue", category: "Queue", icon: "≡", color: "#231f20", description: "Event streaming" },
  { id: "rabbitmq", label: "RabbitMQ", type: "queue", category: "Queue", icon: "🐰", color: "#ff6600", description: "Message broker" },
  { id: "s3", label: "AWS S3", type: "storage", category: "Storage", icon: "🪣", color: "#ff9900", description: "Object storage" },
  { id: "openai", label: "OpenAI", type: "ai", category: "AI Services", icon: "✦", color: "#10a37f", description: "LLM API" },
  { id: "auth0", label: "Auth Service", type: "auth", category: "Security", icon: "🔐", color: "#eb5424", description: "Authentication" },
  { id: "datadog", label: "Datadog", type: "monitoring", category: "Monitoring", icon: "📊", color: "#632ca6", description: "Observability" },
  { id: "docker", label: "Docker", type: "devops", category: "DevOps", icon: "🐳", color: "#2496ed", description: "Containers" },
  { id: "kubernetes", label: "Kubernetes", type: "devops", category: "DevOps", icon: "☸", color: "#326ce5", description: "Orchestration" },
];

export const CATEGORIES: ComponentCategory[] = [
  "Frontend",
  "Backend",
  "Database",
  "Cache",
  "Queue",
  "CDN",
  "AI Services",
  "Storage",
  "Monitoring",
  "Security",
  "DevOps",
];

export function getComponentsByCategory(category: ComponentCategory) {
  return COMPONENT_CATALOG.filter((c) => c.category === category);
}

export function getCatalogItem(id: string) {
  return COMPONENT_CATALOG.find((c) => c.id === id);
}

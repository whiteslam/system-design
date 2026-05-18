import type { DiagramJson, StudioEdge, StudioNode } from "@/types/diagram";

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  diagram: DiagramJson;
}

function node(
  id: string,
  type: StudioNode["type"],
  label: string,
  x: number,
  y: number,
  extra?: Partial<StudioNode["data"]>
): StudioNode {
  return {
    id,
    type,
    position: { x, y },
    data: { label, ...extra },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  edgeType: StudioEdge["type"] = "api",
  label?: string
): StudioEdge {
  return {
    id,
    source,
    target,
    type: edgeType,
    data: { edgeType, label },
  };
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: "saas",
    name: "SaaS Platform",
    description: "Classic multi-tenant SaaS with API, cache, and Postgres",
    diagram: {
      nodes: [
        node("fe", "frontend", "Next.js App", 80, 200),
        node("cdn", "cdn", "Cloudflare CDN", 280, 80),
        node("api", "api", "API Gateway", 480, 200),
        node("auth", "auth", "Auth Service", 480, 360),
        node("cache", "cache", "Redis", 680, 80),
        node("db", "database", "PostgreSQL", 680, 280),
      ],
      edges: [
        edge("e1", "fe", "cdn", "cdn"),
        edge("e2", "cdn", "api", "api"),
        edge("e3", "api", "auth", "api"),
        edge("e4", "api", "cache", "database", "cache read"),
        edge("e5", "api", "db", "database"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.85 },
    },
  },
  {
    id: "chat",
    name: "Chat App",
    description: "Realtime messaging with WebSockets and Redis pub/sub",
    diagram: {
      nodes: [
        node("fe", "frontend", "React Client", 60, 220),
        node("ws", "api", "WebSocket Server", 320, 220),
        node("api", "api", "REST API", 320, 380),
        node("redis", "cache", "Redis Pub/Sub", 560, 160),
        node("db", "database", "PostgreSQL", 560, 340),
        node("queue", "queue", "Message Queue", 560, 480),
      ],
      edges: [
        edge("e1", "fe", "ws", "websocket", "live messages"),
        edge("e2", "fe", "api", "api"),
        edge("e3", "ws", "redis", "queue"),
        edge("e4", "api", "db", "database"),
        edge("e5", "api", "queue", "queue"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.85 },
    },
  },
  {
    id: "streaming",
    name: "Netflix-style Streaming",
    description: "CDN delivery, encoding pipeline, recommendation AI",
    diagram: {
      nodes: [
        node("fe", "frontend", "Streaming UI", 40, 240),
        node("cdn", "cdn", "Global CDN", 260, 100),
        node("api", "api", "Content API", 480, 240),
        node("storage", "storage", "S3 Media", 700, 120),
        node("queue", "queue", "Encoding Queue", 700, 280),
        node("ai", "ai", "Recommendation AI", 700, 420),
        node("db", "database", "Catalog DB", 480, 420),
      ],
      edges: [
        edge("e1", "fe", "cdn", "cdn", "video stream"),
        edge("e2", "cdn", "api", "api"),
        edge("e3", "api", "storage", "api"),
        edge("e4", "api", "db", "database"),
        edge("e5", "api", "ai", "api"),
        edge("e6", "queue", "storage", "queue"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Storefront, payments, inventory, search",
    diagram: {
      nodes: [
        node("fe", "frontend", "Storefront", 80, 200),
        node("api", "api", "Commerce API", 340, 200),
        node("cache", "cache", "Redis Sessions", 340, 40),
        node("db", "database", "Orders DB", 600, 200),
        node("search", "ai", "Search Service", 600, 360),
        node("storage", "storage", "Product Images", 600, 40),
      ],
      edges: [
        edge("e1", "fe", "api", "api"),
        edge("e2", "api", "cache", "database"),
        edge("e3", "api", "db", "database"),
        edge("e4", "api", "search", "api"),
        edge("e5", "api", "storage", "api"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.85 },
    },
  },
  {
    id: "social",
    name: "Social Media",
    description: "Feed, notifications, media uploads",
    diagram: {
      nodes: [
        node("fe", "frontend", "Mobile/Web App", 60, 260),
        node("cdn", "cdn", "CDN", 280, 80),
        node("api", "api", "Graph API", 500, 260),
        node("feed", "queue", "Feed Service", 720, 140),
        node("notif", "queue", "Notification Queue", 720, 300),
        node("db", "database", "Social Graph DB", 500, 440),
        node("storage", "storage", "Media Storage", 280, 400),
      ],
      edges: [
        edge("e1", "fe", "cdn", "cdn"),
        edge("e2", "fe", "api", "api"),
        edge("e3", "api", "feed", "queue"),
        edge("e4", "api", "notif", "queue"),
        edge("e5", "api", "db", "database"),
        edge("e6", "api", "storage", "api"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: "banking",
    name: "Banking / Fintech",
    description: "Secure transactions, audit logs, compliance",
    diagram: {
      nodes: [
        node("fe", "frontend", "Banking Portal", 80, 220),
        node("waf", "cdn", "WAF / CDN", 300, 80),
        node("api", "api", "Core Banking API", 520, 220),
        node("auth", "auth", "MFA Auth", 520, 380),
        node("db", "database", "Ledger DB", 740, 220),
        node("audit", "monitoring", "Audit Logs", 740, 380),
        node("queue", "queue", "Transaction Queue", 300, 380),
      ],
      edges: [
        edge("e1", "fe", "waf", "cdn"),
        edge("e2", "waf", "api", "api"),
        edge("e3", "api", "auth", "api"),
        edge("e4", "api", "db", "database"),
        edge("e5", "api", "audit", "api"),
        edge("e6", "api", "queue", "queue"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: "ai-platform",
    name: "AI Platform",
    description: "LLM gateway, vector DB, job workers",
    diagram: {
      nodes: [
        node("fe", "frontend", "AI Dashboard", 60, 240),
        node("api", "api", "AI Gateway", 320, 240),
        node("openai", "ai", "OpenAI", 580, 120),
        node("vector", "database", "Vector DB", 580, 280),
        node("queue", "queue", "Job Queue", 580, 420),
        node("storage", "storage", "Model Artifacts", 320, 420),
        node("cache", "cache", "Redis Cache", 320, 80),
      ],
      edges: [
        edge("e1", "fe", "api", "api"),
        edge("e2", "api", "openai", "api"),
        edge("e3", "api", "vector", "database"),
        edge("e4", "api", "queue", "queue"),
        edge("e5", "api", "cache", "database"),
        edge("e6", "api", "storage", "api"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: "lms",
    name: "LMS",
    description: "Courses, video delivery, progress tracking",
    diagram: {
      nodes: [
        node("fe", "frontend", "LMS Portal", 80, 220),
        node("cdn", "cdn", "Video CDN", 300, 80),
        node("api", "api", "LMS API", 520, 220),
        node("db", "database", "Course DB", 740, 220),
        node("storage", "storage", "Video Storage", 300, 360),
        node("analytics", "monitoring", "Analytics", 520, 380),
      ],
      edges: [
        edge("e1", "fe", "cdn", "cdn", "video"),
        edge("e2", "fe", "api", "api"),
        edge("e3", "api", "db", "database"),
        edge("e4", "api", "storage", "api"),
        edge("e5", "api", "analytics", "api"),
      ],
      viewport: { x: 0, y: 0, zoom: 0.85 },
    },
  },
];

export function getTemplateById(id: string) {
  return DIAGRAM_TEMPLATES.find((t) => t.id === id);
}

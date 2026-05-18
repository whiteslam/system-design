import type { AIDiagramOutput } from "@/types/diagram";

export interface DiagramGenerationContext {
  projectName: string;
  projectDescription?: string | null;
  features?: string[];
  preferredStack?: string | null;
  architecture?: string | null;
  expectedUsers?: string | null;
}

export function buildDiagramPrompt(ctx: DiagramGenerationContext): string {
  return `You are a principal cloud architect. Generate an interactive system architecture diagram as JSON.

## Project
**Name:** ${ctx.projectName}
**Description:** ${ctx.projectDescription ?? "N/A"}
**Features:** ${ctx.features?.join(", ") ?? "N/A"}
**Stack:** ${ctx.preferredStack ?? "N/A"}
**Scale:** ${ctx.expectedUsers ?? "N/A"}

## Architecture context (from blueprint)
${ctx.architecture?.slice(0, 3000) ?? "Design a production-grade architecture from the project details."}

## Output rules
Respond ONLY with valid JSON (no markdown fences):

{
  "title": "Architecture title",
  "nodes": [
    {
      "id": "unique-id",
      "type": "frontend|api|database|cache|queue|cdn|ai|storage|auth|monitoring|devops",
      "label": "Service name",
      "description": "Brief role",
      "position": { "x": 100, "y": 200 },
      "metadata": { "serviceType": "...", "scaling": "...", "status": "healthy" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-id",
      "target": "node-id",
      "type": "api|websocket|queue|cdn|database",
      "label": "connection label"
    }
  ],
  "suggestions": ["Add Redis cache?", "Consider CDN for static assets"],
  "healthWarnings": ["Single point of failure at API layer"]
}

Requirements:
- 6-15 nodes for a realistic system
- Spread positions between x: 0-1200, y: 0-800 (left-to-right flow)
- Include appropriate databases, caches, queues when scale warrants
- Use correct edge types (websocket for realtime, queue for async, cdn for static)
- Provide 2-4 actionable suggestions and 1-3 health warnings`;
}

export function parseAIDiagramOutput(raw: string): AIDiagramOutput {
  const parsed = JSON.parse(raw) as AIDiagramOutput;
  if (!parsed.nodes || !parsed.edges) {
    throw new Error("Invalid diagram structure from AI");
  }
  return parsed;
}

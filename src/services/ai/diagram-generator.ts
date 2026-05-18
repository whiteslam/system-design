import type { AIDiagramOutput, DiagramJson, StudioEdge, StudioNode } from "@/types/diagram";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import {
  buildDiagramPrompt,
  parseAIDiagramOutput,
  type DiagramGenerationContext,
} from "./diagram-prompts";

export function aiOutputToDiagram(output: AIDiagramOutput): DiagramJson {
  const nodes: StudioNode[] = output.nodes.map((n, i) => ({
    id: n.id,
    type: n.type,
    position: n.position ?? {
      x: 100 + (i % 4) * 280,
      y: 100 + Math.floor(i / 4) * 160,
    },
    data: {
      label: n.label,
      description: n.description,
      ...n.metadata,
    },
  }));

  const edges: StudioEdge[] = output.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    data: { edgeType: e.type, label: e.label },
  }));

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 0.75 },
  };
}

export async function generateDiagramFromAI(
  ctx: DiagramGenerationContext
): Promise<{
  diagram: DiagramJson;
  title?: string;
  suggestions: string[];
  healthWarnings: string[];
}> {
  const client = getOpenRouterClient();
  const prompt = buildDiagramPrompt(ctx);

  const response = await client.chat.completions.create({
    model: getOpenRouterModel(),
    messages: [
      {
        role: "system",
        content:
          "You are an expert system architect. Output valid JSON only for React Flow diagrams.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from AI");

  const output = parseAIDiagramOutput(raw);
  return {
    diagram: aiOutputToDiagram(output),
    title: output.title,
    suggestions: output.suggestions ?? [],
    healthWarnings: output.healthWarnings ?? [],
  };
}

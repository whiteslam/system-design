import type { DiagramJson } from "@/types/diagram";
import type { SuggestionImplementationResult } from "@/types/suggestion-implementation";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import { formatOpenRouterError } from "@/lib/ai/openrouter-errors";
import { parseBlueprintJson } from "@/lib/ai/parse-response";

export function buildImplementSuggestionPrompt(
  diagram: DiagramJson,
  suggestion: string,
  suggestions: string[],
  healthWarnings: string[]
): string {
  const nodeSummary = diagram.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    label: n.data.label,
    x: Math.round(n.position.x),
    y: Math.round(n.position.y),
  }));

  const edgeSummary = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
  }));

  return `You are a principal cloud architect updating an existing system diagram.

## Current diagram
Nodes: ${JSON.stringify(nodeSummary)}
Edges: ${JSON.stringify(edgeSummary)}

## Suggestion to implement NOW
"${suggestion}"

## All pending suggestions
${suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Current health warnings
${healthWarnings.length ? healthWarnings.map((w, i) => `${i + 1}. ${w}`).join("\n") : "None"}

## Task
1. Add/modify the diagram to implement ONLY this suggestion (new nodes, edges, or metadata updates on existing nodes).
2. Place new nodes near related services (x: 0-1400, y: 0-900). Use unique ids prefixed with "impl-".
3. Connect new components with correct edge types (api, queue, database, websocket, cdn).
4. Update remaining suggestions (remove the implemented one; keep others that still apply).
5. Refresh health warnings: remove issues this change fixes; keep or add warnings if gaps remain.

Respond ONLY with valid JSON:
{
  "summary": "One sentence what was added",
  "nodes": [{ "id": "...", "type": "api|database|cache|queue|cdn|frontend|ai|storage|auth|monitoring|devops", "label": "...", "description": "...", "position": { "x": 0, "y": 0 }, "metadata": {} }],
  "edges": [{ "id": "...", "source": "existing-or-new-id", "target": "...", "type": "api|websocket|queue|cdn|database", "label": "..." }],
  "nodeUpdates": [{ "id": "existing-node-id", "metadata": { "scaling": "...", "status": "healthy" } }],
  "remainingSuggestions": ["..."],
  "remainingHealthWarnings": ["..."]
}`;
}

export async function implementSuggestionWithAI(
  diagram: DiagramJson,
  suggestion: string,
  suggestions: string[],
  healthWarnings: string[]
): Promise<SuggestionImplementationResult> {
  const client = getOpenRouterClient();
  const prompt = buildImplementSuggestionPrompt(
    diagram,
    suggestion,
    suggestions,
    healthWarnings
  );

  let response;
  try {
    response = await client.chat.completions.create({
      model: getOpenRouterModel(),
      messages: [
        {
          role: "system",
          content:
            "You implement architecture improvements as diagram patches. Output valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });
  } catch (firstErr) {
    try {
      response = await client.chat.completions.create({
        model: getOpenRouterModel(),
        messages: [
          {
            role: "system",
            content:
              "You implement architecture improvements as diagram patches. Output valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      });
    } catch {
      throw new Error(formatOpenRouterError(firstErr));
    }
  }

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from AI");

  let parsed: Record<string, unknown>;
  try {
    parsed = parseBlueprintJson(raw) as Record<string, unknown>;
  } catch {
    throw new Error("AI returned an invalid implementation format");
  }

  return {
    summary: String(parsed.summary ?? "Suggestion applied"),
    nodes: (parsed.nodes as SuggestionImplementationResult["nodes"]) ?? [],
    edges: (parsed.edges as SuggestionImplementationResult["edges"]) ?? [],
    nodeUpdates:
      (parsed.nodeUpdates as SuggestionImplementationResult["nodeUpdates"]) ??
      [],
    remainingSuggestions: Array.isArray(parsed.remainingSuggestions)
      ? (parsed.remainingSuggestions as string[])
      : suggestions.filter((s) => s !== suggestion),
    remainingHealthWarnings: Array.isArray(parsed.remainingHealthWarnings)
      ? (parsed.remainingHealthWarnings as string[])
      : healthWarnings,
  };
}

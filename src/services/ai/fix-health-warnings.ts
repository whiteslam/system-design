import type { DiagramJson } from "@/types/diagram";
import type { SuggestionImplementationResult } from "@/types/suggestion-implementation";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import { formatOpenRouterError } from "@/lib/ai/openrouter-errors";
import { parseBlueprintJson } from "@/lib/ai/parse-response";

function diagramContext(diagram: DiagramJson) {
  const nodeSummary = diagram.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    label: n.data.label,
    status: n.data.status,
    x: Math.round(n.position.x),
    y: Math.round(n.position.y),
  }));
  const edgeSummary = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
  }));
  return { nodeSummary, edgeSummary };
}

function buildFixHealthPrompt(
  diagram: DiagramJson,
  healthWarnings: string[],
  suggestions: string[],
  focusWarning?: string
): string {
  const { nodeSummary, edgeSummary } = diagramContext(diagram);
  const targets = focusWarning ? [focusWarning] : healthWarnings;

  return `You are a principal cloud architect hardening a production system diagram for **strong security** and operational resilience.

## Current diagram
Nodes: ${JSON.stringify(nodeSummary)}
Edges: ${JSON.stringify(edgeSummary)}

## Health issues to resolve NOW
${targets.map((w, i) => `${i + 1}. ${w}`).join("\n")}

## All open health warnings (context)
${healthWarnings.map((w, i) => `${i + 1}. ${w}`).join("\n")}

## Pending AI suggestions (do not implement these; only reference if relevant)
${suggestions.length ? suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n") : "None"}

## Task — security-first remediation
1. **Security (highest priority):** Add or wire controls for auth abuse (rate limiting, bot/WAF, MFA step-up), secrets management, encryption, least-privilege IAM, audit logging, and DDoS/edge protection where warnings mention auth, credentials, or public APIs.
2. **Reliability:** Add failover, replication, health checks, or redundant paths for single points of failure.
3. **Performance:** Add back-pressure, queue consumers, caching, or scaling hints where bottlenecks are cited.
4. Add new nodes/edges OR update existing node metadata; use unique ids prefixed with "health-".
5. Set remediated services to status "healthy" where appropriate via nodeUpdates.
6. Remove resolved warnings from remainingHealthWarnings; keep warnings still valid after your patch.
7. Do not remove pending suggestions unless they are fully superseded by this fix.

Respond ONLY with valid JSON:
{
  "summary": "One sentence describing security/resilience improvements",
  "nodes": [{ "id": "...", "type": "api|database|cache|queue|cdn|frontend|ai|storage|auth|monitoring|devops", "label": "...", "description": "...", "position": { "x": 0, "y": 0 }, "metadata": {} }],
  "edges": [{ "id": "...", "source": "...", "target": "...", "type": "api|websocket|queue|cdn|database", "label": "..." }],
  "nodeUpdates": [{ "id": "existing-node-id", "metadata": { "scaling": "...", "status": "healthy" } }],
  "remainingSuggestions": ["..."],
  "remainingHealthWarnings": ["..."]
}`;
}

async function callFixHealthAI(
  prompt: string
): Promise<SuggestionImplementationResult> {
  const client = getOpenRouterClient();

  let response;
  try {
    response = await client.chat.completions.create({
      model: getOpenRouterModel(),
      messages: [
        {
          role: "system",
          content:
            "You remediate architecture health and security gaps as diagram patches. Output valid JSON only. Prioritize strong security controls.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_tokens: 3500,
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
              "You remediate architecture health and security gaps as diagram patches. Output valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.35,
        max_tokens: 3500,
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
    throw new Error("AI returned an invalid health fix format");
  }

  return {
    summary: String(parsed.summary ?? "Health issues addressed"),
    nodes: (parsed.nodes as SuggestionImplementationResult["nodes"]) ?? [],
    edges: (parsed.edges as SuggestionImplementationResult["edges"]) ?? [],
    nodeUpdates:
      (parsed.nodeUpdates as SuggestionImplementationResult["nodeUpdates"]) ??
      [],
    remainingSuggestions: Array.isArray(parsed.remainingSuggestions)
      ? (parsed.remainingSuggestions as string[])
      : [],
    remainingHealthWarnings: Array.isArray(parsed.remainingHealthWarnings)
      ? (parsed.remainingHealthWarnings as string[])
      : [],
  };
}

export async function fixHealthWarningWithAI(
  diagram: DiagramJson,
  healthWarning: string,
  healthWarnings: string[],
  suggestions: string[]
): Promise<SuggestionImplementationResult> {
  const prompt = buildFixHealthPrompt(
    diagram,
    healthWarnings,
    suggestions,
    healthWarning
  );
  const result = await callFixHealthAI(prompt);
  return {
    ...result,
    remainingSuggestions:
      result.remainingSuggestions.length > 0
        ? result.remainingSuggestions
        : suggestions,
    remainingHealthWarnings:
      result.remainingHealthWarnings.length > 0
        ? result.remainingHealthWarnings
        : healthWarnings.filter((w) => w !== healthWarning),
  };
}

export async function fixAllHealthWarningsWithAI(
  diagram: DiagramJson,
  healthWarnings: string[],
  suggestions: string[]
): Promise<SuggestionImplementationResult> {
  const prompt = buildFixHealthPrompt(diagram, healthWarnings, suggestions);
  const result = await callFixHealthAI(prompt);
  return {
    ...result,
    remainingSuggestions:
      result.remainingSuggestions.length > 0
        ? result.remainingSuggestions
        : suggestions,
    remainingHealthWarnings:
      result.remainingHealthWarnings.length > 0
        ? result.remainingHealthWarnings
        : [],
  };
}

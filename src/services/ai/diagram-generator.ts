import type { DiagramJson } from "@/types/diagram";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import { formatOpenRouterError } from "@/lib/ai/openrouter-errors";
import { aiOutputToDiagram } from "@/lib/diagram/from-ai-output";
import {
  buildDiagramPrompt,
  parseAIDiagramOutput,
  type DiagramGenerationContext,
} from "./diagram-prompts";

export { aiOutputToDiagram } from "@/lib/diagram/from-ai-output";

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
  const model = getOpenRouterModel();

  let response;
  try {
    response = await client.chat.completions.create({
      model,
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
  } catch (firstErr) {
    try {
      response = await client.chat.completions.create({
        model,
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
      });
    } catch {
      throw new Error(formatOpenRouterError(firstErr));
    }
  }

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from AI");

  try {
    const output = parseAIDiagramOutput(raw);
    return {
      diagram: aiOutputToDiagram(output),
      title: output.title,
      suggestions: output.suggestions ?? [],
      healthWarnings: output.healthWarnings ?? [],
    };
  } catch {
    throw new Error(
      "AI returned an invalid diagram format. Try again or use a template."
    );
  }
}

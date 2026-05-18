import type { BlueprintContent, GenerateBlueprintInput } from "@/types";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import { buildSystemDesignPrompt } from "./prompts";

export async function generateBlueprint(
  input: GenerateBlueprintInput
): Promise<{ content: BlueprintContent; usage: { prompt: number; completion: number } }> {
  const client = getOpenRouterClient();
  const prompt = buildSystemDesignPrompt(input);

  const response = await client.chat.completions.create({
    model: getOpenRouterModel(),
    messages: [
      {
        role: "system",
        content:
          "You are an expert system architect. Always respond with valid JSON only, no markdown fences.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(raw) as Record<string, string>;

  const content: BlueprintContent = {
    overview: parsed.overview ?? "",
    architecture: parsed.architecture ?? "",
    database: parsed.database ?? "",
    apis: parsed.apis ?? "",
    security: parsed.security ?? "",
    deployment: parsed.deployment ?? "",
    scaling: parsed.scaling ?? "",
    recommendedStack: parsed.recommendedStack ?? "",
    folderStructure: parsed.folderStructure ?? "",
    techStackReasoning: parsed.techStackReasoning ?? "",
  };

  return {
    content,
    usage: {
      prompt: response.usage?.prompt_tokens ?? 0,
      completion: response.usage?.completion_tokens ?? 0,
    },
  };
}

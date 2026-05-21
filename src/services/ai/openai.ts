import OpenAI from "openai";
import type { BlueprintContent, GenerateBlueprintInput } from "@/types";
import { getOpenRouterClient, getOpenRouterModel } from "@/lib/ai/openrouter";
import {
  getOpenRouterFreeModels,
  getOpenRouterMergeModel,
  useMultiModelGeneration,
} from "@/lib/ai/models";
import { parseBlueprintJson, toBlueprintContent } from "@/lib/ai/parse-response";
import { formatOpenRouterError } from "@/lib/ai/openrouter-errors";
import {
  buildCombineBlueprintsPrompt,
  buildSystemDesignPrompt,
} from "./prompts";

const SYSTEM_JSON =
  "You are an expert system architect. Always respond with valid JSON only, no markdown fences.";

type ModelDraft = {
  model: string;
  content: BlueprintContent;
  usage: { prompt: number; completion: number };
};

async function callModelForBlueprint(
  client: OpenAI,
  model: string,
  prompt: string
): Promise<ModelDraft> {
  let response;
  try {
    response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_JSON },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
      response_format: { type: "json_object" },
    });
  } catch (firstErr) {
    try {
      response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_JSON },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 6000,
      });
    } catch {
      throw firstErr;
    }
  }

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("No response from AI");
  }

  const parsed = parseBlueprintJson(raw);
  return {
    model,
    content: toBlueprintContent(parsed),
    usage: {
      prompt: response.usage?.prompt_tokens ?? 0,
      completion: response.usage?.completion_tokens ?? 0,
    },
  };
}

async function mergeDrafts(
  client: OpenAI,
  input: GenerateBlueprintInput,
  drafts: ModelDraft[]
): Promise<ModelDraft> {
  const mergeModel = getOpenRouterMergeModel();
  const combinePrompt = buildCombineBlueprintsPrompt(
    input,
    drafts.map((d) => ({
      model: d.model,
      content: d.content as unknown as Record<string, string>,
    }))
  );

  let response;
  try {
    response = await client.chat.completions.create({
      model: mergeModel,
      messages: [
        { role: "system", content: SYSTEM_JSON },
        { role: "user", content: combinePrompt },
      ],
      temperature: 0.5,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });
  } catch (firstErr) {
    try {
      response = await client.chat.completions.create({
        model: mergeModel,
        messages: [
          { role: "system", content: SYSTEM_JSON },
          { role: "user", content: combinePrompt },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      });
    } catch {
      throw firstErr;
    }
  }

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Merge model returned no response");
  }

  const parsed = parseBlueprintJson(raw);
  const sourceModels = drafts.map((d) => d.model).join(", ");

  const content = toBlueprintContent(parsed);
  const mergeNote = `\n\n---\n*Blueprint synthesized from ${drafts.length} AI models (${sourceModels}) via ${mergeModel}.*`;
  if (content.overview) {
    content.overview += mergeNote;
  }

  return {
    model: mergeModel,
    content,
    usage: {
      prompt:
        (response.usage?.prompt_tokens ?? 0) +
        drafts.reduce((s, d) => s + d.usage.prompt, 0),
      completion:
        (response.usage?.completion_tokens ?? 0) +
        drafts.reduce((s, d) => s + d.usage.completion, 0),
    },
  };
}

async function generateWithMultipleModels(
  client: OpenAI,
  input: GenerateBlueprintInput,
  prompt: string
): Promise<ModelDraft> {
  const models = getOpenRouterFreeModels();
  const results = await Promise.allSettled(
    models.map((model) => callModelForBlueprint(client, model, prompt))
  );

  const succeeded: ModelDraft[] = [];
  const errors: string[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      succeeded.push(result.value);
    } else {
      const msg =
        result.reason instanceof Error
          ? result.reason.message
          : "Unknown error";
      errors.push(`${models[i]}: ${msg}`);
    }
  });

  if (succeeded.length === 0) {
    throw new Error(
      `All ${models.length} models failed.\n${errors.slice(0, 4).join("\n")}`
    );
  }

  if (succeeded.length === 1) {
    return succeeded[0];
  }

  return mergeDrafts(client, input, succeeded);
}

export async function generateBlueprint(
  input: GenerateBlueprintInput
): Promise<{
  content: BlueprintContent;
  usage: { prompt: number; completion: number };
  modelsUsed?: string[];
}> {
  const client = getOpenRouterClient();
  const prompt = buildSystemDesignPrompt(input);

  try {
    if (!useMultiModelGeneration()) {
      const model = getOpenRouterModel();
      const draft = await callModelForBlueprint(client, model, prompt);
      return {
        content: draft.content,
        usage: draft.usage,
        modelsUsed: [model],
      };
    }

    const models = getOpenRouterFreeModels();
    const merged = await generateWithMultipleModels(client, input, prompt);
    return {
      content: merged.content,
      usage: merged.usage,
      modelsUsed: models,
    };
  } catch (err) {
    const message = formatOpenRouterError(err);
    if (message.includes("OPENROUTER_API_KEY")) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured. Add it to .env.local"
      );
    }
    throw new Error(message);
  }
}

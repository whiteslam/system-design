/** Default free OpenRouter models — https://openrouter.ai/models?free=true */
export const DEFAULT_FREE_MODELS = [
  "openai/gpt-oss-120b:free",
  "openai/gpt-oss-20b:free",
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
] as const;

/** Model that merges multiple drafts into one blueprint */
export const DEFAULT_MERGE_MODEL = "openai/gpt-oss-120b:free";

export function getOpenRouterFreeModels(): string[] {
  const fromEnv = process.env.OPENROUTER_FREE_MODELS?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }
  return [...DEFAULT_FREE_MODELS];
}

export function getOpenRouterMergeModel(): string {
  return (
    process.env.OPENROUTER_MERGE_MODEL?.trim() ||
    process.env.OPENROUTER_MODEL?.trim() ||
    DEFAULT_MERGE_MODEL
  );
}

export function useMultiModelGeneration(): boolean {
  if (process.env.OPENROUTER_USE_MULTI_MODEL === "false") {
    return false;
  }
  return getOpenRouterFreeModels().length > 1;
}

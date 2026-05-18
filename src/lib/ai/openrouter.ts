import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Add it to .env.local"
    );
  }

  const siteUrl =
    process.env.OPENROUTER_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const appName =
    process.env.OPENROUTER_APP_NAME ?? "ArchFlow AI";

  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": siteUrl,
      "X-OpenRouter-Title": appName,
    },
  });
}

export function getOpenRouterModel() {
  return process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-120b:free";
}

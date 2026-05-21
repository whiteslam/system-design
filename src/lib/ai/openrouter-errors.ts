export function formatOpenRouterError(err: unknown): string {
  const apiErr = err as { status?: number; message?: string };
  if (apiErr.status === 401) {
    return "Invalid OpenRouter API key. Check OPENROUTER_API_KEY in .env.local";
  }
  if (apiErr.status === 402) {
    return "OpenRouter credits exhausted. Add credits at openrouter.ai/settings/credits";
  }
  if (apiErr.status === 429) {
    return "AI rate limit hit. Wait a minute and try again.";
  }
  return apiErr.message ?? "AI request failed";
}

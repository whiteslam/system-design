/** Parse AI JSON safely (markdown fences, trailing text, nested objects). */
export function parseIntelligenceJson<T = Record<string, unknown>>(
  raw: string
): T {
  let cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  const attempts = [
    cleaned,
    cleaned.replace(/,\s*([}\]])/g, "$1"),
  ];

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    attempts.push(cleaned.slice(start, end + 1));
  }

  let lastError: Error | null = null;
  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate) as T;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  const hint = lastError?.message?.includes("Unexpected")
    ? "The model returned malformed JSON."
    : "Could not parse the AI response.";
  throw new Error(`${hint} Please run the simulation again.`);
}

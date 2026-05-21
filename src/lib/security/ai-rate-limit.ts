import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";

const AI_ACTION_LIMITS: Record<string, { limit: number; windowSec: number }> = {
  "generate-blueprint": { limit: 10, windowSec: 3600 },
  "intelligence-analysis": { limit: 20, windowSec: 3600 },
  "intelligence-security": { limit: 15, windowSec: 3600 },
  "intelligence-cost": { limit: 15, windowSec: 3600 },
  "intelligence-simulation": { limit: 25, windowSec: 3600 },
  "intelligence-devops": { limit: 15, windowSec: 3600 },
  "intelligence-chat": { limit: 40, windowSec: 3600 },
  "diagram-ai": { limit: 30, windowSec: 3600 },
  "implement-suggestion": { limit: 40, windowSec: 3600 },
};

export function enforceAiRateLimit(
  userId: string,
  action: keyof typeof AI_ACTION_LIMITS | string
): { ok: true } | { ok: false; error: string } {
  const config = AI_ACTION_LIMITS[action] ?? { limit: 30, windowSec: 3600 };
  const result = rateLimit(getRateLimitKey(userId, action), config);

  if (!result.success) {
    const minutes = Math.max(
      1,
      Math.ceil((result.resetAt - Date.now()) / 60000)
    );
    return {
      ok: false,
      error: `Rate limit exceeded. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  return { ok: true };
}

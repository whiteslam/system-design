/**
 * Server-side subscription gating (prepare for Razorpay).
 * Wire webhooks + DB plan column before enabling strict checks.
 */

export type PlanTier = "free" | "pro" | "enterprise";

export interface PlanAccess {
  tier: PlanTier;
  /** When false, premium routes should return 403 from server actions */
  isPremium: boolean;
}

/** Resolve user plan from DB — extend when subscriptions table exists */
export async function getUserPlan(_userId: string): Promise<PlanAccess> {
  // TODO: SELECT plan FROM users or subscriptions WHERE user_id = ...
  return { tier: "free", isPremium: false };
}

/**
 * Gate premium features server-side. Call at the start of protected server actions.
 * Set STRICT_PREMIUM_GATING=true in production once billing is live.
 */
export async function assertPremiumAccess(
  userId: string,
  feature: string
): Promise<{ allowed: true } | { allowed: false; error: string }> {
  const strict = process.env.STRICT_PREMIUM_GATING === "true";
  if (!strict) {
    return { allowed: true };
  }

  const plan = await getUserPlan(userId);
  if (plan.isPremium) {
    return { allowed: true };
  }

  return {
    allowed: false,
    error: `Premium subscription required for ${feature}. Upgrade your plan to continue.`,
  };
}

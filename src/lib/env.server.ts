/**
 * Server-only environment validation. Never import from client components.
 */

const SERVER_SECRET_KEYS = [
  "OPENROUTER_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_SECRET",
] as const;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  );
}

export function getOpenRouterApiKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return key || null;
}

export function assertOpenRouterConfigured(): void {
  if (!getOpenRouterApiKey()) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Add it in Vercel Environment Variables."
    );
  }
}

/** True if key exists in process.env (not necessarily valid) */
export function hasServerSecret(name: (typeof SERVER_SECRET_KEYS)[number]): boolean {
  return Boolean(process.env[name]?.trim());
}

/**
 * Validates production deployment env. Call from health check or startup diagnostics.
 * Returns list of missing recommended keys (non-fatal unless critical).
 */
export function auditProductionEnv(): {
  ok: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  if (!getOpenRouterApiKey()) {
    missing.push("OPENROUTER_API_KEY");
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXT_PUBLIC_SITE_URL && !process.env.VERCEL_URL) {
      warnings.push("NEXT_PUBLIC_SITE_URL (recommended for OG URLs)");
    }
    if (!hasServerSecret("SUPABASE_SERVICE_ROLE_KEY")) {
      warnings.push(
        "SUPABASE_SERVICE_ROLE_KEY (optional; required for admin webhooks/cron)"
      );
    }
    if (!hasServerSecret("RAZORPAY_KEY_ID")) {
      warnings.push("RAZORPAY_KEY_ID (required when billing is enabled)");
    }
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

/** Prevent accidental exposure of service role to client bundles */
export function getServiceRoleKey(): string | null {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must never be accessed on the client");
  }
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? null;
}

import { NextResponse } from "next/server";
import { auditProductionEnv } from "@/lib/env.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = auditProductionEnv();

  return NextResponse.json(
    {
      status: env.ok ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks: {
        supabase: env.missing.includes("NEXT_PUBLIC_SUPABASE_URL")
          ? "missing"
          : "configured",
        openrouter: env.missing.includes("OPENROUTER_API_KEY")
          ? "missing"
          : "configured",
      },
      missing: env.missing,
      warnings: env.warnings,
    },
    { status: env.ok ? 200 : 503 }
  );
}

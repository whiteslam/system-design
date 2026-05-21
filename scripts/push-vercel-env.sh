#!/usr/bin/env bash
# Push .env.local variables to Vercel (Production + Preview).
# Requires: npm i -g vercel && vercel login && vercel link
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env.local — copy from .env.example and fill values."
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install Vercel CLI: npm i -g vercel"
  exit 1
fi

# Keys required for /api/health status: ok
REQUIRED_KEYS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_SITE_URL
  OPENROUTER_API_KEY
  OPENROUTER_MODEL
  OPENROUTER_FREE_MODELS
  OPENROUTER_MERGE_MODEL
  OPENROUTER_USE_MULTI_MODEL
  OPENROUTER_SITE_URL
  OPENROUTER_APP_NAME
  SUPABASE_SERVICE_ROLE_KEY
  STRICT_PREMIUM_GATING
)

echo "Linking project (if needed)..."
cd "$ROOT"
vercel link --yes 2>/dev/null || vercel link

for key in "${REQUIRED_KEYS[@]}"; do
  value="$(grep -E "^${key}=" "$ENV_FILE" | head -1 | cut -d= -f2- || true)"
  if [[ -z "$value" ]]; then
    echo "Skip (empty): $key"
    continue
  fi
  echo "Setting $key for Production + Preview..."
  printf '%s' "$value" | vercel env add "$key" production preview --force
done

echo ""
echo "Done. Redeploy for changes to apply:"
echo "  vercel --prod"
echo "Then check: https://YOUR_DOMAIN/api/health"

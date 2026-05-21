# ArchFlow AI — Production deployment guide

Deploy to **Vercel** (frontend + serverless) and **Supabase** (Postgres + Auth).

---

## Pre-deploy checklist

### Code & build

- [ ] `npm run build` succeeds locally or on Vercel
- [ ] `npm run lint` passes
- [ ] No secrets in git (only `.env.example` committed)
- [ ] `GET /api/health` returns `status: "ok"` in production

### Supabase

- [ ] Run SQL in order: `schema.sql` → `schema-phase2.sql` → `schema-phase3.sql` (or `schema-complete.sql`)
- [ ] Run `production-indexes.sql` for query performance
- [ ] Email auth enabled (Authentication → Providers)
- [ ] RLS enabled on all tables (policies from schema files)
- [ ] Redirect URLs: add `https://your-domain.com/**` and `http://localhost:3000/**`

### Vercel

- [ ] Project connected to Git repository
- [ ] All env vars set (see below)
- [ ] `NEXT_PUBLIC_SITE_URL` = production URL (e.g. `https://app.archflow.ai`)
- [ ] Region: `bom1` or nearest to users (configured in `vercel.json`)
- [ ] Pro plan recommended for 60s AI server actions (`vercel.json` `maxDuration`)

### Security

- [ ] `OPENROUTER_API_KEY` server-only (no `NEXT_PUBLIC_` prefix)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to client
- [ ] `STRICT_PREMIUM_GATING=false` until Razorpay webhooks + plan DB are live
- [ ] Security headers active (see `next.config.ts`)

### Billing (when ready)

- [ ] Razorpay keys in Vercel env
- [ ] Webhook endpoint + `RAZORPAY_WEBHOOK_SECRET`
- [ ] `users.plan` or `subscriptions` table + RLS
- [ ] Set `STRICT_PREMIUM_GATING=true`
- [ ] Server actions call `assertPremiumAccess()` for premium routes

### Observability (recommended)

- [ ] Sentry `SENTRY_DSN` + source maps upload
- [ ] PostHog or Vercel Analytics
- [ ] Monitor `/api/health` uptime

---

## Environment variables

| Variable | Required | Client-safe |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Yes |
| `OPENROUTER_API_KEY` | Yes | **No** |
| `OPENROUTER_MODEL` | Yes | No |
| `OPENROUTER_FREE_MODELS` | Optional | No |
| `OPENROUTER_MERGE_MODEL` | Optional | No |
| `OPENROUTER_USE_MULTI_MODEL` | Optional | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional* | **No** |
| `RAZORPAY_KEY_ID` | When billing | **No** |
| `RAZORPAY_SECRET` | When billing | **No** |
| `STRICT_PREMIUM_GATING` | Optional | No |
| `SENTRY_DSN` | Optional | No |

\*Required for admin webhooks and service-role cron jobs.

Copy from `.env.example` and fill values in **Vercel → Settings → Environment Variables** for Production, Preview, and Development.

---

## Vercel deployment steps

1. Push `main` to GitHub/GitLab.
2. Import project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables (Production).
5. Deploy.
6. Assign custom domain; set `NEXT_PUBLIC_SITE_URL` to that domain; redeploy.
7. Verify:
   - Landing page loads
   - Sign up / login
   - Generate blueprint
   - Studio canvas
   - `/api/health`

### AI timeouts

Long-running AI calls (blueprint generation, intelligence) may need **Pro** plan for `maxDuration: 60` in `vercel.json`. On Hobby, keep prompts lean or split multi-model merge.

---

## Supabase setup

1. Create project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run schemas (see `README.md`).
3. **Authentication** → URL configuration:
   - Site URL: your Vercel domain
   - Redirect URLs: `https://your-domain.com/**`
4. **API** → copy Project URL and `anon` key to Vercel env.
5. **Settings → API** → `service_role` key → Vercel only (never client).
6. Run `supabase/production-indexes.sql`.

### RLS

All user data is scoped by `user_id` in schema policies. Do not disable RLS in production.

---

## Post-deploy smoke test

1. Register new user → lands on dashboard.
2. Generate blueprint → completes, view blueprint page.
3. Open Studio → drag node, wait for autosave (saved indicator).
4. Run traffic simulation → metrics render.
5. Copy full prompt from blueprint → Full prompt section.
6. Log out → protected routes redirect to `/login`.

---

## Performance notes (already optimized)

- Dashboard uses narrow Supabase selects + pagination.
- Studio autosave is light (JSON only, no normalized table churn per keystroke).
- React Flow uses selective Zustand subscriptions + `onlyRenderVisibleElements`.
- Package import optimization in `next.config.ts`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails fetching Google Fonts | Project uses system fonts (no build-time font fetch). |
| `Supabase is not configured` | Set `NEXT_PUBLIC_SUPABASE_*` on Vercel and redeploy. |
| AI returns 401 | Check `OPENROUTER_API_KEY` and credits at openrouter.ai. |
| 504 on generate | Upgrade Vercel plan or reduce `OPENROUTER_USE_MULTI_MODEL` models. |
| Rate limit errors | Expected; limits in `src/lib/security/ai-rate-limit.ts`. Use Upstash Redis for multi-instance. |

---

## Launch readiness

**Ready for public beta** when checklist above is complete and smoke tests pass.

**Enable paid plans** when Razorpay webhooks and `assertPremiumAccess` are wired with `STRICT_PREMIUM_GATING=true`.

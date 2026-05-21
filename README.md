# ArchFlow AI

AI-powered system design platform. Transform project ideas into production-grade architecture blueprints.

## Tech Stack

- **Frontend:** Next.js 15+ App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Server Actions, Supabase
- **Database:** PostgreSQL (Supabase)
- **AI:** OpenRouter (`openai/gpt-oss-120b:free`)
- **State:** Zustand

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Enable Email auth in Authentication settings

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key
# Optional alias: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=ArchFlow AI
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # UI, layout, sections
├── features/         # Feature modules (auth, generate, blueprints)
├── actions/          # Server actions
├── services/         # AI & external services
├── lib/              # Utilities, Supabase, validations
├── store/            # Zustand stores
└── types/            # TypeScript types
```

## Features

### Phase 1
- Email/password authentication (Supabase Auth)
- AI system design generation (architecture, database, APIs, security, deployment)
- Project & blueprint management
- Beautiful markdown blueprint viewer with copy support
- Responsive dashboard with glassmorphism UI

### Phase 2 — Visual System Design Studio
- Interactive React Flow canvas at `/studio/[projectId]`
- Drag-and-drop component palette (Frontend, Backend, DB, Cache, Queue, CDN, AI, etc.)
- 10 custom node types with animated edges
- AI architecture generation → auto-rendered diagram from blueprint
- 8 starter templates (SaaS, Chat, Streaming, E-commerce, Social, Banking, AI, LMS)
- Auto-save with debounce, undo/redo, keyboard shortcuts
- Export PNG, SVG, PDF, JSON, Markdown
- Properties panel, AI health warnings & suggestions
- Dagre auto-layout

**Supabase setup (run in SQL Editor, in order):**
1. `supabase/schema.sql` — Phase 1 (users, projects, blueprints)
2. `supabase/schema-phase2.sql` — Phase 2 (diagrams studio)

Or run everything at once: `supabase/schema-complete.sql`

### Phase 3 — Engineering Intelligence
- Architecture health analysis with production readiness scores (`/analysis/[projectId]`)
- Scalability planner, cloud recommendations, observability (`/scaling/[projectId]`)
- Security audit with severity-ranked vulnerabilities (`/security/[projectId]`)
- Multi-provider cost estimation with charts (`/costs/[projectId]`)
- DevOps config generator: Docker, K8s, GitHub Actions, Nginx, Terraform (`/devops/[projectId]`)
- Traffic simulation with animated service metrics (`/simulations/[projectId]`)
- Infrastructure AI chat on the analysis page

**Supabase setup (add after Phase 1 & 2):**
3. `supabase/schema-phase3.sql` — intelligence tables (reports, costs, simulations, deployment configs)

## Production deploy

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full checklist, Vercel + Supabase setup, env vars, security, and smoke tests.

Quick health check after deploy: `GET https://your-domain.com/api/health`

## Deploy

Deploy to [Vercel](https://vercel.com) and add environment variables from `.env.example`.

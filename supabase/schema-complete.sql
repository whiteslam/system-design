-- ArchFlow AI — Full database setup (Phase 1 + Phase 2)
-- Run this once in Supabase SQL Editor on a new project.

-- ArchFlow AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  expected_users TEXT,
  budget TEXT,
  preferred_stack TEXT,
  auth_type TEXT,
  realtime_requirements TEXT,
  file_upload_needs TEXT,
  ai_features TEXT,
  deployment_preference TEXT,
  scale TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Blueprints
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  overview TEXT,
  architecture TEXT,
  database_design TEXT,
  api_design TEXT,
  security_plan TEXT,
  deployment_plan TEXT,
  scaling_strategy TEXT,
  recommended_stack TEXT,
  folder_structure TEXT,
  tech_stack_reasoning TEXT,
  raw_content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI Generations log
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  blueprint_id UUID REFERENCES public.blueprints(id) ON DELETE SET NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  model TEXT DEFAULT 'gpt-4o',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON public.blueprints(project_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON public.blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON public.ai_generations(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER blueprints_updated_at BEFORE UPDATE ON public.blueprints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Blueprints policies
CREATE POLICY "Users can view own blueprints" ON public.blueprints
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own blueprints" ON public.blueprints
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blueprints" ON public.blueprints
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own blueprints" ON public.blueprints
  FOR DELETE USING (auth.uid() = user_id);

-- AI generations policies
CREATE POLICY "Users can view own generations" ON public.ai_generations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own generations" ON public.ai_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========== Phase 2: Studio ==========
CREATE TABLE IF NOT EXISTS public.diagrams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Architecture Diagram',
  diagram_json JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id)
);

CREATE TABLE IF NOT EXISTS public.diagram_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID NOT NULL REFERENCES public.diagrams(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(diagram_id, node_id)
);

CREATE TABLE IF NOT EXISTS public.diagram_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagram_id UUID NOT NULL REFERENCES public.diagrams(id) ON DELETE CASCADE,
  edge_id TEXT NOT NULL,
  source_node TEXT NOT NULL,
  target_node TEXT NOT NULL,
  edge_type TEXT NOT NULL DEFAULT 'api',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(diagram_id, edge_id)
);

CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON public.diagrams(project_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON public.diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_nodes_diagram_id ON public.diagram_nodes(diagram_id);
CREATE INDEX IF NOT EXISTS idx_diagram_edges_diagram_id ON public.diagram_edges(diagram_id);

DROP TRIGGER IF EXISTS diagrams_updated_at ON public.diagrams;
CREATE TRIGGER diagrams_updated_at BEFORE UPDATE ON public.diagrams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own diagrams" ON public.diagrams;
DROP POLICY IF EXISTS "Users can create own diagrams" ON public.diagrams;
DROP POLICY IF EXISTS "Users can update own diagrams" ON public.diagrams;
DROP POLICY IF EXISTS "Users can delete own diagrams" ON public.diagrams;

CREATE POLICY "Users can view own diagrams" ON public.diagrams
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own diagrams" ON public.diagrams
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diagrams" ON public.diagrams
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diagrams" ON public.diagrams
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own diagram nodes" ON public.diagram_nodes;
DROP POLICY IF EXISTS "Users can manage own diagram edges" ON public.diagram_edges;

CREATE POLICY "Users can manage own diagram nodes" ON public.diagram_nodes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.diagrams d WHERE d.id = diagram_id AND d.user_id = auth.uid())
  );
CREATE POLICY "Users can manage own diagram edges" ON public.diagram_edges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.diagrams d WHERE d.id = diagram_id AND d.user_id = auth.uid())
  );

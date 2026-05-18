-- =============================================================================
-- ArchFlow AI — Phase 2: Visual System Design Studio
-- =============================================================================
-- PREREQUISITE: Run supabase/schema.sql (Phase 1) FIRST.
-- Or run the all-in-one file: supabase/schema-complete.sql
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'projects'
  ) THEN
    RAISE EXCEPTION
      'Phase 1 schema is missing. Open supabase/schema.sql, run it in the SQL Editor, then run this script again.';
  END IF;
END $$;

-- Required by updated_at trigger (safe if Phase 1 already created it)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

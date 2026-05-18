-- ArchFlow AI Phase 3: Advanced Engineering Intelligence
-- Prerequisite: schema.sql + schema-phase2.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'projects'
  ) THEN
    RAISE EXCEPTION 'Run Phase 1 schema (schema.sql) first.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.architecture_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  scalability_score INTEGER DEFAULT 0,
  reliability_score INTEGER DEFAULT 0,
  security_score INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  maintainability_score INTEGER DEFAULT 0,
  cost_efficiency_score INTEGER DEFAULT 0,
  availability_score INTEGER DEFAULT 0,
  devops_readiness_score INTEGER DEFAULT 0,
  recommendations JSONB DEFAULT '[]',
  category_insights JSONB DEFAULT '{}',
  warnings JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.security_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vulnerabilities JSONB DEFAULT '[]',
  severity_summary JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  overall_risk TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cost_estimations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  estimated_monthly_cost NUMERIC(12, 2) DEFAULT 0,
  estimated_yearly_cost NUMERIC(12, 2) DEFAULT 0,
  breakdown_json JSONB DEFAULT '{}',
  optimizations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.traffic_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  concurrent_users INTEGER NOT NULL,
  bottlenecks JSONB DEFAULT '[]',
  simulation_results JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.deployment_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  config_type TEXT NOT NULL,
  generated_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_architecture_reports_project ON public.architecture_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_security_reports_project ON public.security_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_estimations_project ON public.cost_estimations(project_id);
CREATE INDEX IF NOT EXISTS idx_traffic_simulations_project ON public.traffic_simulations(project_id);
CREATE INDEX IF NOT EXISTS idx_deployment_configs_project ON public.deployment_configs(project_id);

DROP TRIGGER IF EXISTS architecture_reports_updated_at ON public.architecture_reports;
CREATE TRIGGER architecture_reports_updated_at BEFORE UPDATE ON public.architecture_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.architecture_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_estimations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_configs ENABLE ROW LEVEL SECURITY;

-- architecture_reports
DROP POLICY IF EXISTS "Users manage own architecture reports" ON public.architecture_reports;
CREATE POLICY "Users manage own architecture reports" ON public.architecture_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own security reports" ON public.security_reports;
CREATE POLICY "Users manage own security reports" ON public.security_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own cost estimations" ON public.cost_estimations;
CREATE POLICY "Users manage own cost estimations" ON public.cost_estimations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own traffic simulations" ON public.traffic_simulations;
CREATE POLICY "Users manage own traffic simulations" ON public.traffic_simulations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own deployment configs" ON public.deployment_configs;
CREATE POLICY "Users manage own deployment configs" ON public.deployment_configs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

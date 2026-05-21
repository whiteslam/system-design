-- Production performance indexes (run after schema-complete.sql)
-- Safe to re-run: IF NOT EXISTS

CREATE INDEX IF NOT EXISTS idx_projects_user_created
  ON public.projects (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blueprints_user_created
  ON public.blueprints (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blueprints_project_id
  ON public.blueprints (project_id);

CREATE INDEX IF NOT EXISTS idx_diagrams_project_id
  ON public.diagrams (project_id);

CREATE INDEX IF NOT EXISTS idx_diagram_nodes_diagram_id
  ON public.diagram_nodes (diagram_id);

CREATE INDEX IF NOT EXISTS idx_diagram_edges_diagram_id
  ON public.diagram_edges (diagram_id);

CREATE INDEX IF NOT EXISTS idx_architecture_reports_project_created
  ON public.architecture_reports (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_reports_project_created
  ON public.security_reports (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cost_estimations_project_created
  ON public.cost_estimations (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_traffic_simulations_project_created
  ON public.traffic_simulations (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployment_configs_project_created
  ON public.deployment_configs (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_created
  ON public.ai_generations (user_id, created_at DESC);

export type ProjectStatus = "draft" | "generating" | "completed" | "failed";
export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  features: string[];
  expected_users: string | null;
  budget: string | null;
  preferred_stack: string | null;
  auth_type: string | null;
  realtime_requirements: string | null;
  file_upload_needs: string | null;
  ai_features: string | null;
  deployment_preference: string | null;
  scale: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface BlueprintContent {
  overview: string;
  architecture: string;
  database: string;
  apis: string;
  security: string;
  deployment: string;
  scaling: string;
  recommendedStack: string;
  folderStructure: string;
  techStackReasoning: string;
}

export interface Blueprint {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  overview: string | null;
  architecture: string | null;
  database_design: string | null;
  api_design: string | null;
  security_plan: string | null;
  deployment_plan: string | null;
  scaling_strategy: string | null;
  recommended_stack: string | null;
  folder_structure: string | null;
  tech_stack_reasoning: string | null;
  raw_content: BlueprintContent | null;
  created_at: string;
  updated_at: string;
  projects?: Pick<Project, "name" | "preferred_stack" | "scale" | "status">;
}

export interface AIGeneration {
  id: string;
  user_id: string;
  project_id: string | null;
  blueprint_id: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  model: string;
  status: GenerationStatus;
  error_message: string | null;
  created_at: string;
}

export interface GenerateBlueprintInput {
  projectName: string;
  projectDescription: string;
  features: string[];
  expectedUsers: string;
  budget: string;
  preferredStack: string;
  authType: string;
  realtimeRequirements: string;
  fileUploadNeeds: string;
  aiFeatures: string;
  deploymentPreference: string;
  complexityLevel?: number;
}

export type BlueprintSection =
  | "overview"
  | "architecture"
  | "database"
  | "apis"
  | "security"
  | "deployment"
  | "scaling"
  | "stack";

import type { GenerateBlueprintInput } from "@/types";

export function buildSystemDesignPrompt(input: GenerateBlueprintInput): string {
  return `You are a panel of senior engineers: Staff Software Engineer, Cloud Architect, DevOps Engineer, Database Architect, and Security Engineer.

Generate a production-grade system design blueprint for the following project. Be specific, avoid generic advice, and explain your reasoning. Use markdown formatting with headers, bullet points, code blocks, and diagrams described in ASCII where helpful.

## Project Details

**Name:** ${input.projectName}
**Description:** ${input.projectDescription}
**Features:** ${input.features.join(", ")}
**Expected Users:** ${input.expectedUsers}
**Budget:** ${input.budget}
**Preferred Stack:** ${input.preferredStack}
**Authentication:** ${input.authType}
**Realtime Requirements:** ${input.realtimeRequirements || "None specified"}
**File Upload Needs:** ${input.fileUploadNeeds || "None specified"}
**AI Features:** ${input.aiFeatures || "None specified"}
**Deployment Preference:** ${input.deploymentPreference}
**Complexity Level:** ${input.complexityLevel ?? 5}/10

## Required Output Format

Respond ONLY with valid JSON (no markdown code fences) in this exact structure:

{
  "overview": "Executive summary with goals, constraints, and key architectural decisions (markdown)",
  "architecture": "High-level architecture with components, data flow, service boundaries, ASCII diagram (markdown)",
  "database": "Complete database schema with tables, relationships, indexes, RLS considerations (markdown with SQL examples)",
  "apis": "REST/GraphQL API design with endpoints, request/response examples, versioning (markdown)",
  "security": "Authentication, authorization, encryption, OWASP mitigations, secrets management (markdown)",
  "deployment": "CI/CD pipeline, infrastructure, environment strategy, monitoring (markdown)",
  "scaling": "Horizontal/vertical scaling, caching, CDN, queue strategy, cost optimization (markdown)",
  "recommendedStack": "Final tech stack with specific tools and versions (markdown)",
  "folderStructure": "Recommended project folder structure for the chosen stack (markdown with tree)",
  "techStackReasoning": "Why each technology was chosen over alternatives (markdown)"
}

Each field must contain detailed, actionable content suitable for a production system. Minimum 300 words per major section.`;
}

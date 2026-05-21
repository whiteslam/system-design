import type { Blueprint } from "@/types";

export type PromptSectionId =
  | "context"
  | "overview"
  | "architecture"
  | "database"
  | "apis"
  | "security"
  | "deployment"
  | "scaling"
  | "stack"
  | "folder_structure"
  | "tech_stack_reasoning"
  | "instructions";

export interface PromptSectionConfig {
  id: PromptSectionId;
  label: string;
  description: string;
  /** Included by default in the generated prompt */
  defaultEnabled: boolean;
  /** User can toggle off (false = always included, e.g. instructions) */
  optional: boolean;
  getContent: (blueprint: Blueprint) => string | null;
}

export const PROMPT_SECTIONS: PromptSectionConfig[] = [
  {
    id: "context",
    label: "Project context",
    description: "Title, stack, scale, and status metadata",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => {
      const lines = [`Blueprint title: ${bp.title}`, `Blueprint ID: ${bp.id}`];
      const p = bp.projects;
      if (p?.name) lines.push(`Project name: ${p.name}`);
      if (p?.preferred_stack) lines.push(`Preferred stack: ${p.preferred_stack}`);
      if (p?.scale) lines.push(`Scale: ${p.scale}`);
      if (p?.status) lines.push(`Project status: ${p.status}`);
      lines.push(`Generated: ${bp.created_at}`);
      return lines.join("\n");
    },
  },
  {
    id: "overview",
    label: "Overview",
    description: "Executive summary, goals, and constraints",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.overview,
  },
  {
    id: "architecture",
    label: "Architecture",
    description: "System design, components, and data flow",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.architecture,
  },
  {
    id: "database",
    label: "Database",
    description: "Schema, storage, and data layer",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.database_design,
  },
  {
    id: "apis",
    label: "APIs",
    description: "Endpoints, contracts, and integrations",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.api_design,
  },
  {
    id: "security",
    label: "Security",
    description: "Auth, compliance, and threat mitigations",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.security_plan,
  },
  {
    id: "deployment",
    label: "Deployment",
    description: "CI/CD, hosting, and release strategy",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.deployment_plan,
  },
  {
    id: "scaling",
    label: "Scaling",
    description: "Load, autoscaling, and capacity planning",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.scaling_strategy,
  },
  {
    id: "stack",
    label: "Recommended stack",
    description: "Technologies and tooling choices",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.recommended_stack,
  },
  {
    id: "folder_structure",
    label: "Folder structure",
    description: "Repository layout and module organization",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.folder_structure,
  },
  {
    id: "tech_stack_reasoning",
    label: "Tech stack reasoning",
    description: "Why each technology was chosen",
    defaultEnabled: true,
    optional: true,
    getContent: (bp) => bp.tech_stack_reasoning,
  },
  {
    id: "instructions",
    label: "Implementation instructions",
    description: "How the AI/developer should use this blueprint",
    defaultEnabled: true,
    optional: false,
    getContent: () =>
      `Use this blueprint as the single source of truth. Implement every included section with production-grade quality: secure defaults, observability, error handling, tests for critical paths, and documentation. Where the blueprint specifies a stack or service, use it unless you document a justified deviation. Deliver code, configuration, and deployment artifacts that match the architecture diagrams and operational requirements above.`,
  },
];

const SECTION_HEADINGS: Record<PromptSectionId, string> = {
  context: "Project context",
  overview: "Overview",
  architecture: "Architecture",
  database: "Database design",
  apis: "API design",
  security: "Security plan",
  deployment: "Deployment plan",
  scaling: "Scaling strategy",
  stack: "Recommended technology stack",
  folder_structure: "Folder structure",
  tech_stack_reasoning: "Technology choices and reasoning",
  instructions: "Implementation instructions",
};

export function getDefaultPromptSelection(): Record<PromptSectionId, boolean> {
  return Object.fromEntries(
    PROMPT_SECTIONS.map((s) => [s.id, s.defaultEnabled])
  ) as Record<PromptSectionId, boolean>;
}

export function buildMasterPrompt(
  blueprint: Blueprint,
  enabled: Record<PromptSectionId, boolean>
): string {
  const parts: string[] = [
    `# Master implementation prompt: ${blueprint.title}`,
    "",
    "You are a senior full-stack engineer and cloud architect. Build or extend this product using the complete system design specification below. Treat every section as mandatory requirements unless explicitly omitted from this prompt.",
    "",
    "---",
    "",
  ];

  for (const section of PROMPT_SECTIONS) {
    if (!enabled[section.id]) continue;
    const content = section.getContent(blueprint)?.trim();
    if (!content) continue;

    parts.push(`## ${SECTION_HEADINGS[section.id]}`);
    parts.push("");
    parts.push(content);
    parts.push("");
    parts.push("---");
    parts.push("");
  }

  const enabledLabels = PROMPT_SECTIONS.filter(
    (s) => enabled[s.id] && s.optional
  ).map((s) => s.label);

  parts.push("## Prompt metadata");
  parts.push("");
  parts.push(`- Sections included: ${enabledLabels.length ? enabledLabels.join(", ") : "instructions only"}`);
  parts.push(`- Blueprint: ${blueprint.title}`);
  parts.push(`- Use this entire message as your implementation brief.`);

  return parts.join("\n").trim();
}

export function countPromptCharacters(text: string): number {
  return text.length;
}

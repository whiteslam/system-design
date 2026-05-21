import type { BlueprintContent } from "@/types";

export function parseBlueprintJson(raw: string): Record<string, string> {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as Record<string, string>;
}

export function toBlueprintContent(
  parsed: Record<string, string>
): BlueprintContent {
  return {
    overview: parsed.overview ?? "",
    architecture: parsed.architecture ?? "",
    database: parsed.database ?? "",
    apis: parsed.apis ?? "",
    security: parsed.security ?? "",
    deployment: parsed.deployment ?? "",
    scaling: parsed.scaling ?? "",
    recommendedStack: parsed.recommendedStack ?? "",
    folderStructure: parsed.folderStructure ?? "",
    techStackReasoning: parsed.techStackReasoning ?? "",
  };
}

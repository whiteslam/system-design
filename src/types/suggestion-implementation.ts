import type { AIDiagramEdge, AIDiagramNode } from "@/types/diagram";

export interface NodeDataUpdate {
  id: string;
  metadata?: Record<string, unknown>;
}

export interface SuggestionImplementationResult {
  nodes: AIDiagramNode[];
  edges: AIDiagramEdge[];
  nodeUpdates: NodeDataUpdate[];
  remainingSuggestions: string[];
  remainingHealthWarnings: string[];
  summary: string;
}

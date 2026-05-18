import type { Edge, Node, Viewport } from "@xyflow/react";

export type StudioNodeType =
  | "frontend"
  | "api"
  | "database"
  | "cache"
  | "queue"
  | "cdn"
  | "ai"
  | "storage"
  | "auth"
  | "monitoring"
  | "devops";

export type StudioEdgeType = "api" | "websocket" | "queue" | "cdn" | "database";

export interface StudioNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  serviceType?: string;
  scaling?: string;
  notes?: string;
  color?: string;
  status?: "healthy" | "warning" | "critical";
  componentId?: string;
}

export type StudioNode = Node<StudioNodeData, StudioNodeType>;
export type StudioEdge = Edge<{ label?: string; edgeType?: StudioEdgeType }, StudioEdgeType>;

export interface DiagramViewport extends Viewport {
  zoom: number;
}

export interface DiagramJson {
  nodes: StudioNode[];
  edges: StudioEdge[];
  viewport: DiagramViewport;
}

export interface Diagram {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  diagram_json: DiagramJson;
  created_at: string;
  updated_at: string;
}

export interface AIDiagramNode {
  id: string;
  type: StudioNodeType;
  label: string;
  description?: string;
  position?: { x: number; y: number };
  metadata?: Partial<StudioNodeData>;
}

export interface AIDiagramEdge {
  id: string;
  source: string;
  target: string;
  type: StudioEdgeType;
  label?: string;
}

export interface AIDiagramOutput {
  nodes: AIDiagramNode[];
  edges: AIDiagramEdge[];
  title?: string;
  suggestions?: string[];
  healthWarnings?: string[];
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

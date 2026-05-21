import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  type NodeChange,
  addEdge,
} from "@xyflow/react";
import type {
  DiagramJson,
  DiagramViewport,
  SaveStatus,
  StudioEdge,
  StudioNode,
  StudioNodeType,
} from "@/types/diagram";
import type { SuggestionImplementationResult } from "@/types/suggestion-implementation";
import { aiOutputToDiagram } from "@/lib/diagram/from-ai-output";

interface HistorySnapshot {
  nodes: StudioNode[];
  edges: StudioEdge[];
}

interface StudioState {
  projectId: string | null;
  diagramId: string | null;
  title: string;
  nodes: StudioNode[];
  edges: StudioEdge[];
  selectedNodeId: string | null;
  saveStatus: SaveStatus;
  suggestions: string[];
  healthWarnings: string[];
  viewport: DiagramViewport;
  fitViewNonce: number;
  diagramRevision: number;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  isInitialized: boolean;

  initStudio: (payload: {
    projectId: string;
    diagramId: string;
    title: string;
    diagram: DiagramJson;
    suggestions?: string[];
    healthWarnings?: string[];
  }) => void;
  setTitle: (title: string) => void;
  setNodes: (nodes: StudioNode[]) => void;
  setEdges: (edges: StudioEdge[]) => void;
  onNodesChange: OnNodesChange<StudioNode>;
  onEdgesChange: OnEdgesChange<StudioEdge>;
  onConnect: (connection: Connection) => void;
  addNode: (node: StudioNode) => void;
  addComponentAtCenter: (component: {
    id: string;
    label: string;
    type: StudioNodeType;
    color: string;
    description: string;
  }) => void;
  setViewport: (viewport: DiagramViewport) => void;
  triggerFitView: () => void;
  updateNodeData: (id: string, data: Partial<StudioNode["data"]>) => void;
  deleteSelected: () => void;
  duplicateNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setSuggestions: (suggestions: string[]) => void;
  setHealthWarnings: (warnings: string[]) => void;
  applySuggestionImplementation: (
    result: SuggestionImplementationResult
  ) => void;
  loadDiagram: (diagram: DiagramJson) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getDiagramJson: () => DiagramJson;
}

function snapshot(nodes: StudioNode[], edges: StudioEdge[]): HistorySnapshot {
  return {
    nodes: structuredClone(nodes),
    edges: structuredClone(edges),
  };
}

let nodeChangeRaf: number | null = null;
let pendingNodeChanges: NodeChange<StudioNode>[] | null = null;

function flushPendingNodeChanges(
  set: (partial: Partial<StudioState>) => void,
  get: () => StudioState
) {
  if (!pendingNodeChanges) return;
  const changes = pendingNodeChanges;
  pendingNodeChanges = null;
  nodeChangeRaf = null;
  set({
    nodes: applyNodeChanges(changes, get().nodes),
  });
}

export const useStudioStore = create<StudioState>((set, get) => ({
  projectId: null,
  diagramId: null,
  title: "Architecture Diagram",
  nodes: [],
  edges: [],
  selectedNodeId: null,
  saveStatus: "idle",
  suggestions: [],
  healthWarnings: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  fitViewNonce: 0,
  diagramRevision: 0,
  past: [],
  future: [],
  isInitialized: false,

  initStudio: (payload) =>
    set({
      projectId: payload.projectId,
      diagramId: payload.diagramId,
      title: payload.title,
      nodes: payload.diagram.nodes,
      edges: payload.diagram.edges,
      viewport: payload.diagram.viewport ?? { x: 0, y: 0, zoom: 1 },
      suggestions: payload.suggestions ?? [],
      healthWarnings: payload.healthWarnings ?? [],
      past: [],
      future: [],
      isInitialized: true,
      saveStatus: "saved",
      fitViewNonce: payload.diagram.nodes.length > 0 ? 1 : 0,
      diagramRevision: 0,
    }),

  setTitle: (title) =>
    set((s) => ({ title, diagramRevision: s.diagramRevision + 1 })),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    const isDragFrame = changes.some(
      (c) => c.type === "position" && "dragging" in c && c.dragging
    );
    if (isDragFrame) {
      pendingNodeChanges = changes;
      if (nodeChangeRaf == null) {
        nodeChangeRaf = requestAnimationFrame(() => {
          flushPendingNodeChanges(set, get);
        });
      }
      return;
    }
    if (nodeChangeRaf != null) {
      cancelAnimationFrame(nodeChangeRaf);
      nodeChangeRaf = null;
      pendingNodeChanges = null;
    }
    set((s) => ({
      nodes: applyNodeChanges(changes, get().nodes),
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  onEdgesChange: (changes) => {
    set((s) => ({
      edges: applyEdgeChanges(changes, get().edges),
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  onConnect: (connection) => {
    get().pushHistory();
    set((s) => ({
      edges: addEdge(
        {
          ...connection,
          type: "api",
          data: { edgeType: "api", label: "request" },
        },
        get().edges
      ),
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  addNode: (node) => {
    get().pushHistory();
    set((s) => ({
      nodes: [...get().nodes, node],
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  addComponentAtCenter: (component) => {
    const { nodes } = get();
    const offset = nodes.length * 24;
    const newNode: StudioNode = {
      id: `${component.id}-${Date.now()}`,
      type: component.type,
      position: { x: 320 + offset, y: 240 + offset },
      data: {
        label: component.label,
        description: component.description,
        color: component.color,
        componentId: component.id,
        status: "healthy",
      },
    };
    get().addNode(newNode);
    get().triggerFitView();
  },

  setViewport: (viewport) => set({ viewport }),

  triggerFitView: () =>
    set({ fitViewNonce: get().fitViewNonce + 1 }),

  updateNodeData: (id, data) => {
    set((s) => ({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  deleteSelected: () => {
    const { selectedNodeId, nodes, edges } = get();
    if (!selectedNodeId) return;
    get().pushHistory();
    set((s) => ({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      ),
      selectedNodeId: null,
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  duplicateNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (!node) return;
    get().pushHistory();
    const newNode: StudioNode = {
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data, label: `${node.data.label} (copy)` },
      selected: false,
    };
    set((s) => ({
      nodes: [...get().nodes, newNode],
      selectedNodeId: newNode.id,
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  setSuggestions: (suggestions) => set({ suggestions }),

  setHealthWarnings: (healthWarnings) => set({ healthWarnings }),

  applySuggestionImplementation: (result) => {
    get().pushHistory();

    const patch = aiOutputToDiagram({
      nodes: result.nodes,
      edges: result.edges,
    });

    const existingNodeIds = new Set(get().nodes.map((n) => n.id));
    const existingEdgeIds = new Set(get().edges.map((e) => e.id));

    const newNodes = patch.nodes.map((n) => ({
      ...n,
      id: existingNodeIds.has(n.id)
        ? `impl-${n.id}-${Date.now()}`
        : n.id,
    }));

    const newEdges = patch.edges
      .filter((e) => !existingEdgeIds.has(e.id))
      .map((e) => ({
        ...e,
        id: existingEdgeIds.has(e.id)
          ? `impl-edge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          : e.id,
      }));

    const updatedNodes = get().nodes.map((node) => {
      const update = result.nodeUpdates.find((u) => u.id === node.id);
      if (!update?.metadata) return node;
      return {
        ...node,
        data: {
          ...node.data,
          ...update.metadata,
          status:
            (update.metadata.status as StudioNode["data"]["status"]) ??
            node.data.status ??
            "healthy",
        },
      };
    });

    set((s) => ({
      nodes: [...updatedNodes, ...newNodes],
      edges: [...get().edges, ...newEdges],
      suggestions: result.remainingSuggestions,
      healthWarnings: result.remainingHealthWarnings,
      fitViewNonce: get().fitViewNonce + 1,
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  loadDiagram: (diagram) => {
    get().pushHistory();
    set((s) => ({
      nodes: diagram.nodes,
      edges: diagram.edges,
      viewport: diagram.viewport ?? get().viewport,
      fitViewNonce: get().fitViewNonce + 1,
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  pushHistory: () => {
    const { nodes, edges, past } = get();
    const nextPast = [...past, snapshot(nodes, edges)].slice(-50);
    set({ past: nextPast, future: [] });
  },

  undo: () => {
    const { past, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set((s) => ({
      past: past.slice(0, -1),
      future: [snapshot(nodes, edges), ...get().future].slice(0, 50),
      nodes: previous.nodes,
      edges: previous.edges,
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((s) => ({
      future: future.slice(1),
      past: [...get().past, snapshot(nodes, edges)],
      nodes: next.nodes,
      edges: next.edges,
      diagramRevision: s.diagramRevision + 1,
    }));
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  getDiagramJson: () => ({
    nodes: get().nodes,
    edges: get().edges,
    viewport: get().viewport,
  }),
}));

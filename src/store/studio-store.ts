import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  addEdge,
} from "@xyflow/react";
import type {
  DiagramJson,
  SaveStatus,
  StudioEdge,
  StudioNode,
} from "@/types/diagram";

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
  updateNodeData: (id: string, data: Partial<StudioNode["data"]>) => void;
  deleteSelected: () => void;
  duplicateNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setSuggestions: (suggestions: string[]) => void;
  setHealthWarnings: (warnings: string[]) => void;
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
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };
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
      suggestions: payload.suggestions ?? [],
      healthWarnings: payload.healthWarnings ?? [],
      past: [],
      future: [],
      isInitialized: true,
      saveStatus: "saved",
    }),

  setTitle: (title) => set({ title }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    get().pushHistory();
    set({
      edges: addEdge(
        {
          ...connection,
          type: "api",
          data: { edgeType: "api", label: "request" },
        },
        get().edges
      ),
    });
  },

  addNode: (node) => {
    get().pushHistory();
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  deleteSelected: () => {
    const { selectedNodeId, nodes, edges } = get();
    if (!selectedNodeId) return;
    get().pushHistory();
    set({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
      ),
      selectedNodeId: null,
    });
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
    set({ nodes: [...get().nodes, newNode], selectedNodeId: newNode.id });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  setSuggestions: (suggestions) => set({ suggestions }),

  setHealthWarnings: (healthWarnings) => set({ healthWarnings }),

  loadDiagram: (diagram) => {
    get().pushHistory();
    set({ nodes: diagram.nodes, edges: diagram.edges });
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
    set({
      past: past.slice(0, -1),
      future: [snapshot(nodes, edges), ...get().future].slice(0, 50),
      nodes: previous.nodes,
      edges: previous.edges,
    });
  },

  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      future: future.slice(1),
      past: [...get().past, snapshot(nodes, edges)],
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  getDiagramJson: () => ({
    nodes: get().nodes,
    edges: get().edges,
    viewport: { x: 0, y: 0, zoom: 1 },
  }),
}));

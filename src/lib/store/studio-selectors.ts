import { useShallow } from "zustand/react/shallow";
import { useStudioStore } from "@/store/studio-store";
import type { StudioEdge, StudioNode } from "@/types/diagram";
import type { DiagramViewport } from "@/types/diagram";

/** Canvas-only state — avoids rerenders from title, suggestions, save status, etc. */
export function useStudioCanvasState(): {
  nodes: StudioNode[];
  edges: StudioEdge[];
  viewport: DiagramViewport;
  fitViewNonce: number;
  onNodesChange: ReturnType<typeof useStudioStore.getState>["onNodesChange"];
  onEdgesChange: ReturnType<typeof useStudioStore.getState>["onEdgesChange"];
  onConnect: ReturnType<typeof useStudioStore.getState>["onConnect"];
  setSelectedNodeId: ReturnType<typeof useStudioStore.getState>["setSelectedNodeId"];
  addNode: ReturnType<typeof useStudioStore.getState>["addNode"];
  pushHistory: ReturnType<typeof useStudioStore.getState>["pushHistory"];
  setViewport: ReturnType<typeof useStudioStore.getState>["setViewport"];
} {
  return useStudioStore(
    useShallow((s) => ({
      nodes: s.nodes,
      edges: s.edges,
      viewport: s.viewport,
      fitViewNonce: s.fitViewNonce,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect,
      setSelectedNodeId: s.setSelectedNodeId,
      addNode: s.addNode,
      pushHistory: s.pushHistory,
      setViewport: s.setViewport,
    }))
  );
}

export function useSelectedStudioNode() {
  return useStudioStore((s) => {
    if (!s.selectedNodeId) return null;
    return s.nodes.find((n) => n.id === s.selectedNodeId) ?? null;
  });
}

export function useStudioHistoryFlags() {
  return useStudioStore(
    useShallow((s) => ({
      canUndo: s.past.length > 0,
      canRedo: s.future.length > 0,
    }))
  );
}

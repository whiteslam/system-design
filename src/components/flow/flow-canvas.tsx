"use client";

import { memo, useCallback, useRef, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useReactFlow,
  type NodeMouseHandler,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { studioNodeTypes } from "./nodes";
import { studioEdgeTypes } from "./edges/animated-edge";
import { useStudioCanvasState } from "@/lib/store/studio-selectors";
import type { StudioNode } from "@/types/diagram";
import { Layers, MousePointerClick } from "lucide-react";

const FlowCanvasInner = memo(function FlowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const {
    nodes,
    edges,
    viewport,
    fitViewNonce,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    addNode,
    pushHistory,
    setViewport,
  } = useStudioCanvasState();

  const nodeTypes = useMemo(() => studioNodeTypes, []);
  const edgeTypes = useMemo(() => studioEdgeTypes, []);

  useEffect(() => {
    if (fitViewNonce > 0 && nodes.length > 0) {
      const t = setTimeout(() => {
        fitView({ padding: 0.25, duration: 280 });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [fitViewNonce, nodes.length, fitView]);

  const onMoveEnd = useCallback(
    (_: unknown, vp: Viewport) => {
      setViewport(vp);
    },
    [setViewport]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  );

  const onNodeDragStop = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/archflow-component");
      if (!raw) return;

      const component = JSON.parse(raw) as {
        type: StudioNode["type"];
        label: string;
        color: string;
        id: string;
        description: string;
      };

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: StudioNode = {
        id: `${component.id}-${Date.now()}`,
        type: component.type,
        position,
        data: {
          label: component.label,
          description: component.description,
          color: component.color,
          componentId: component.id,
          status: "healthy",
        },
      };

      addNode(newNode);
    },
    [addNode, screenToFlowPosition]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const isEmpty = nodes.length === 0;

  return (
    <div
      ref={reactFlowWrapper}
      className="studio-canvas-host relative h-full w-full"
      id="studio-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={viewport}
        fitView={false}
        onlyRenderVisibleElements
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.15}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: "api" }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        className="studio-flow"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="rgba(148, 163, 184, 0.25)"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="studio-controls"
        />
      </ReactFlow>

      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
          <div className="max-w-sm rounded-2xl border border-dashed border-border/60 bg-card/80 px-6 py-8 text-center shadow-xl backdrop-blur-md">
            <Layers className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Start your architecture diagram
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Drag components from the left panel onto the canvas, or click a
              component to add it. Connect nodes by dragging from one handle to
              another.
            </p>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-primary">
              <MousePointerClick className="h-3.5 w-3.5" />
              Click or drag to add
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export function FlowCanvas() {
  return <FlowCanvasInner />;
}

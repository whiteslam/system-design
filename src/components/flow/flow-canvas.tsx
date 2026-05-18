"use client";

import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { studioNodeTypes } from "./nodes";
import { studioEdgeTypes } from "./edges/animated-edge";
import { useStudioStore } from "@/store/studio-store";
import type { StudioNode } from "@/types/diagram";

function FlowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    addNode,
    pushHistory,
  } = useStudioStore();

  const nodeTypes = useMemo(() => studioNodeTypes, []);
  const edgeTypes = useMemo(() => studioEdgeTypes, []);

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

  return (
    <div ref={reactFlowWrapper} className="h-full w-full" id="studio-canvas">
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: "api" }}
        proOptions={{ hideAttribution: true }}
        className="studio-flow"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls className="!rounded-xl !border-border/50 !bg-card/80 !shadow-xl !backdrop-blur-xl [&>button]:!border-border/50 [&>button]:!bg-transparent [&>button]:hover:!bg-accent" />
        <MiniMap
          className="!rounded-xl !border-border/50 !bg-card/80 !shadow-xl"
          maskColor="rgba(3, 7, 18, 0.7)"
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              frontend: "#61dafb",
              api: "#8b5cf6",
              database: "#336791",
              cache: "#dc382d",
            };
            return colors[n.type ?? ""] ?? "#8b5cf6";
          }}
        />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas() {
  return <FlowCanvasInner />;
}

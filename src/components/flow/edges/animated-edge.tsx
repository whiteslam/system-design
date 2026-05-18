"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

const EDGE_STYLES: Record<
  string,
  { stroke: string; animated?: boolean; dash?: string }
> = {
  api: { stroke: "#8b5cf6", animated: true },
  websocket: { stroke: "#22d3ee", animated: true, dash: "5 5" },
  queue: { stroke: "#f59e0b", animated: true, dash: "8 4" },
  cdn: { stroke: "#06b6d4", animated: false },
  database: { stroke: "#336791", animated: true, dash: "4 4" },
};

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeType = (data?.edgeType as string) ?? "api";
  const style = EDGE_STYLES[edgeType] ?? EDGE_STYLES.api;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: style.dash,
        }}
        className={style.animated ? "studio-edge-animated" : undefined}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded-md border border-border/50 bg-card/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm"
          >
            {String(data.label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const studioEdgeTypes = {
  api: memo(AnimatedEdgeComponent),
  websocket: memo(AnimatedEdgeComponent),
  queue: memo(AnimatedEdgeComponent),
  cdn: memo(AnimatedEdgeComponent),
  database: memo(AnimatedEdgeComponent),
};

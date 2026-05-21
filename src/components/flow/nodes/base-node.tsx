"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { StudioNodeData } from "@/types/diagram";

const STATUS_COLORS = {
  healthy: "border-emerald-500/50",
  warning: "border-amber-500/50",
  critical: "border-red-500/50",
};

interface BaseNodeProps extends NodeProps {
  icon: string;
  accent: string;
  children?: React.ReactNode;
}

function BaseNodeComponent({
  data,
  selected,
  icon,
  accent,
}: BaseNodeProps & { data: StudioNodeData }) {
  const status = data.status ?? "healthy";

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-2xl border-2 bg-card/90 px-4 py-3 shadow-xl backdrop-blur-xl transition-all",
        selected
          ? "border-primary shadow-primary/20 ring-2 ring-primary/30"
          : "border-border/60",
        STATUS_COLORS[status]
      )}
      style={{
        boxShadow: selected ? `0 0 24px ${accent}40` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {data.label}
          </p>
          {data.serviceType && (
            <p className="truncate text-xs text-muted-foreground">
              {data.serviceType}
            </p>
          )}
        </div>
      </div>
      {data.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {data.description}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-background !bg-primary"
      />
    </div>
  );
}

export const createNode = (
  icon: string,
  accent: string
) =>
  memo(function TypedNode(props: NodeProps) {
    return (
      <BaseNodeComponent
        {...props}
        data={props.data as StudioNodeData}
        icon={icon}
        accent={accent}
      />
    );
  });

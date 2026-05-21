"use client";

import { useStudioStore } from "@/store/studio-store";
import { useSelectedStudioNode } from "@/lib/store/studio-selectors";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  className?: string;
  onClose?: () => void;
}

export function PropertiesPanel({ className, onClose }: PropertiesPanelProps) {
  const node = useSelectedStudioNode();
  const updateNodeData = useStudioStore((s) => s.updateNodeData);
  const duplicateNode = useStudioStore((s) => s.duplicateNode);
  const deleteSelected = useStudioStore((s) => s.deleteSelected);

  return (
    <aside
      className={cn(
        "flex h-full w-72 shrink-0 flex-col border-l border-border/50 bg-card/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="border-b border-border/50 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Properties</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {node ? "Edit selected node" : "Select a node on the canvas"}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
              aria-label="Close properties panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!node ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-muted-foreground">
          Click a component to view and edit its configuration
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={node.data.label}
              onChange={(e) =>
                updateNodeData(node.id, { label: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={node.data.description ?? ""}
              onChange={(e) =>
                updateNodeData(node.id, { description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Service type</Label>
            <Input
              value={node.data.serviceType ?? ""}
              onChange={(e) =>
                updateNodeData(node.id, { serviceType: e.target.value })
              }
              placeholder="e.g. REST API"
            />
          </div>
          <div className="space-y-2">
            <Label>Scaling</Label>
            <Input
              value={node.data.scaling ?? ""}
              onChange={(e) =>
                updateNodeData(node.id, { scaling: e.target.value })
              }
              placeholder="e.g. Auto-scale 2-10 instances"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={node.data.status ?? "healthy"}
              onValueChange={(v) =>
                updateNodeData(node.id, {
                  status: v as "healthy" | "warning" | "critical",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={node.data.notes ?? ""}
              onChange={(e) =>
                updateNodeData(node.id, { notes: e.target.value })
              }
              rows={2}
            />
          </div>
          <Separator />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => duplicateNode(node.id)}
              className="flex-1 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              className="flex-1 rounded-xl border border-destructive/50 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

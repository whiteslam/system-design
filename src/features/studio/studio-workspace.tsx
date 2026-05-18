"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { FlowCanvas } from "@/components/flow/flow-canvas";
import { ComponentPalette } from "./component-palette";
import { PropertiesPanel } from "./properties-panel";
import { StudioToolbar } from "./studio-toolbar";
import { AIInsightsPanel } from "./ai-insights-panel";
import { useStudioStore } from "@/store/studio-store";
import { useStudioAutosave } from "@/hooks/use-studio-autosave";
import { useStudioShortcuts } from "@/hooks/use-studio-shortcuts";
import type { Diagram, DiagramJson } from "@/types/diagram";

interface StudioWorkspaceProps {
  projectId: string;
  projectName: string;
  diagram: Diagram;
}

export function StudioWorkspace({
  projectId,
  projectName,
  diagram,
}: StudioWorkspaceProps) {
  const initStudio = useStudioStore((s) => s.initStudio);
  const isInitialized = useStudioStore((s) => s.isInitialized);

  useEffect(() => {
    const json = diagram.diagram_json as DiagramJson;
    initStudio({
      projectId,
      diagramId: diagram.id,
      title: diagram.title,
      diagram: json,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram.id, projectId]);

  useStudioAutosave();
  useStudioShortcuts();

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading studio...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <StudioToolbar projectId={projectId} projectName={projectName} />
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette />
        <div className="relative flex-1">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
          <AIInsightsPanel />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}

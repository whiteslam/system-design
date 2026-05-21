"use client";

import { useEffect, useState } from "react";
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

type MobilePanel = "components" | "properties" | null;

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
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

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
      <div className="flex min-h-screen-safe items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading studio...</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <StudioToolbar
        projectId={projectId}
        projectName={projectName}
        mobilePanel={mobilePanel}
        onMobilePanelChange={setMobilePanel}
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ComponentPalette className="hidden lg:flex" />
        <div className="relative min-h-0 min-w-0 flex-1 bg-card">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
          <AIInsightsPanel />
        </div>
        <PropertiesPanel className="hidden lg:flex" />

        {mobilePanel === "components" && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobilePanel(null)}
              aria-hidden
            />
            <ComponentPalette
              className="fixed inset-y-0 left-0 z-50 flex w-[min(16rem,85vw)] lg:hidden"
              onClose={() => setMobilePanel(null)}
            />
          </>
        )}
        {mobilePanel === "properties" && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobilePanel(null)}
              aria-hidden
            />
            <PropertiesPanel
              className="fixed inset-y-0 right-0 z-50 flex w-[min(18rem,90vw)] lg:hidden"
              onClose={() => setMobilePanel(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}

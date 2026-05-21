"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  LayoutTemplate,
  Download,
  Undo2,
  Redo2,
  Grid3X3,
  ArrowLeft,
  Loader2,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudioStore } from "@/store/studio-store";
import { useStudioHistoryFlags } from "@/lib/store/studio-selectors";
import { generateArchitectureDiagramAction } from "@/actions/diagram";
import {
  exportCanvasAsPng,
  exportCanvasAsSvg,
  exportCanvasAsPdf,
  exportDiagramJson,
  exportDiagramMarkdown,
} from "@/lib/diagram/export";
import { TemplatePicker } from "./template-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MobilePanel = "components" | "properties" | null;

interface StudioToolbarProps {
  projectId: string;
  projectName: string;
  mobilePanel?: MobilePanel;
  onMobilePanelChange?: (panel: MobilePanel) => void;
}

export function StudioToolbar({
  projectId,
  projectName,
  mobilePanel = null,
  onMobilePanelChange,
}: StudioToolbarProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = useStudioStore((s) => s.title);
  const setTitle = useStudioStore((s) => s.setTitle);
  const triggerFitView = useStudioStore((s) => s.triggerFitView);
  const saveStatus = useStudioStore((s) => s.saveStatus);
  const projectIdStore = useStudioStore((s) => s.projectId);
  const { canUndo, canRedo } = useStudioHistoryFlags();
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const loadDiagram = useStudioStore((s) => s.loadDiagram);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const initStudio = useStudioStore((s) => s.initStudio);
  const diagramId = useStudioStore((s) => s.diagramId);
  const getDiagramJson = useStudioStore((s) => s.getDiagramJson);
  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateArchitectureDiagramAction(projectId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.diagram && diagramId) {
        initStudio({
          projectId: projectIdStore!,
          diagramId,
          title: projectName,
          diagram: result.diagram,
          suggestions: result.suggestions,
          healthWarnings: result.healthWarnings,
        });
        toast.success("Architecture generated from AI");
        triggerFitView();
      }
    });
  };

  const handleAutoLayout = async () => {
    const { nodes, edges } = useStudioStore.getState();
    const { applyAutoLayout } = await import("@/lib/diagram/layout");
    pushHistory();
    loadDiagram({
      nodes: applyAutoLayout(nodes, edges),
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    });
    triggerFitView();
    toast.success("Auto layout applied");
  };

  const handleExport = async (type: string) => {
    const el = document.getElementById("studio-canvas") as HTMLElement | null;
    const diagram = getDiagramJson();
    try {
      switch (type) {
        case "png":
          if (el) await exportCanvasAsPng(el);
          break;
        case "svg":
          if (el) await exportCanvasAsSvg(el);
          break;
        case "pdf":
          if (el) await exportCanvasAsPdf(el);
          break;
        case "json":
          exportDiagramJson(diagram);
          break;
        case "md":
          exportDiagramMarkdown(diagram, title);
          break;
      }
      toast.success(`Exported as ${type.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <>
      <header className="flex h-auto min-h-14 shrink-0 flex-col gap-2 border-b border-border/50 bg-card/90 px-3 py-2 backdrop-blur-xl safe-top sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href={`/projects`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          {onMobilePanelChange && (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() =>
                onMobilePanelChange(
                  mobilePanel === "components" ? null : "components"
                )
              }
              aria-label="Toggle components"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 border-transparent bg-transparent px-0 text-sm font-semibold shadow-none focus-visible:border-border focus-visible:bg-background/50"
              aria-label="Diagram title"
            />
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {projectName}
            </p>
          </div>
          {onMobilePanelChange && (
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() =>
                onMobilePanelChange(
                  mobilePanel === "properties" ? null : "properties"
                )
              }
              aria-label="Toggle properties"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canUndo}
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRedo}
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAutoLayout}
            title="Auto layout"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setTemplateOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {["png", "svg", "pdf", "json", "md"].map((t) => (
                <DropdownMenuItem key={t} onClick={() => handleExport(t)}>
                  {t.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="gradient"
            size="sm"
            className="shrink-0"
            onClick={handleGenerate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="hidden md:inline">Generate Architecture</span>
            <span className="md:hidden">Generate</span>
          </Button>
          <span
            className={cn(
              "shrink-0 px-1 text-xs font-medium",
              saveStatus === "saved" && "text-emerald-400",
              saveStatus === "saving" && "text-amber-400",
              saveStatus === "error" && "text-destructive"
            )}
          >
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
            {saveStatus === "error" && "Save failed"}
          </span>
        </div>
      </header>

      <TemplatePicker open={templateOpen} onOpenChange={setTemplateOpen} />
    </>
  );
}

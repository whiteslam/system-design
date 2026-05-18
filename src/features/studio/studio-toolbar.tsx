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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudioStore } from "@/store/studio-store";
import { generateArchitectureDiagramAction } from "@/actions/diagram";
import { applyAutoLayout } from "@/lib/diagram/layout";
import {
  exportCanvasAsPng,
  exportCanvasAsSvg,
  exportCanvasAsPdf,
  exportDiagramJson,
  exportDiagramMarkdown,
} from "@/lib/diagram/export";
import { TemplatePicker } from "./template-picker";
import { cn } from "@/lib/utils";

interface StudioToolbarProps {
  projectId: string;
  projectName: string;
}

export function StudioToolbar({ projectId, projectName }: StudioToolbarProps) {
  const [templateOpen, setTemplateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const title = useStudioStore((s) => s.title);
  const saveStatus = useStudioStore((s) => s.saveStatus);
  const projectIdStore = useStudioStore((s) => s.projectId);
  const nodes = useStudioStore((s) => s.nodes);
  const edges = useStudioStore((s) => s.edges);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const canUndo = useStudioStore((s) => s.canUndo);
  const canRedo = useStudioStore((s) => s.canRedo);
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
      }
    });
  };

  const handleAutoLayout = () => {
    pushHistory();
    loadDiagram({
      nodes: applyAutoLayout(nodes, edges),
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    });
    toast.success("Auto layout applied");
  };

  const handleExport = async (type: string) => {
    const el = document.querySelector(".studio-flow") as HTMLElement | null;
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
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-semibold leading-none">{title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canUndo()}
            onClick={undo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRedo()}
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
            onClick={() => setTemplateOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
                Export
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
            onClick={handleGenerate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Architecture
          </Button>
        </div>

        <span
          className={cn(
            "text-xs font-medium",
            saveStatus === "saved" && "text-emerald-400",
            saveStatus === "saving" && "text-amber-400",
            saveStatus === "error" && "text-destructive"
          )}
        >
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "error" && "Save failed"}
          {saveStatus === "idle" && ""}
        </span>
      </header>

      <TemplatePicker open={templateOpen} onOpenChange={setTemplateOpen} />
    </>
  );
}

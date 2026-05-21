"use client";

import { DIAGRAM_TEMPLATES } from "@/lib/diagram/templates";
import { useStudioStore } from "@/store/studio-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePicker({ open, onOpenChange }: TemplatePickerProps) {
  const loadDiagram = useStudioStore((s) => s.loadDiagram);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const triggerFitView = useStudioStore((s) => s.triggerFitView);

  if (!open) return null;

  const applyTemplate = (templateId: string) => {
    const template = DIAGRAM_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    pushHistory();
    loadDiagram(template.diagram);
    triggerFitView();
    onOpenChange(false);
    toast.success(`Applied "${template.name}" template`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <h3 className="text-lg font-semibold">Architecture Templates</h3>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto p-4 sm:grid-cols-2">
          {DIAGRAM_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.id)}
              className="rounded-xl border border-border/50 bg-background/40 p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <p className="font-semibold">{t.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.description}
              </p>
              <p className="mt-2 text-xs text-primary">
                {t.diagram.nodes.length} nodes · {t.diagram.edges.length} connections
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

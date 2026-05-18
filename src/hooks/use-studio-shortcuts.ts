"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/store/studio-store";

export function useStudioShortcuts() {
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const deleteSelected = useStudioStore((s) => s.deleteSelected);
  const duplicateNode = useStudioStore((s) => s.duplicateNode);
  const selectedNodeId = useStudioStore((s) => s.selectedNodeId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        deleteSelected();
      }
      if (mod && e.key === "d" && selectedNodeId) {
        e.preventDefault();
        duplicateNode(selectedNodeId);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, deleteSelected, duplicateNode, selectedNodeId]);
}

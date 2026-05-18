"use client";

import { useEffect, useRef } from "react";
import { saveDiagramAction } from "@/actions/diagram";
import { useStudioStore } from "@/store/studio-store";

const DEBOUNCE_MS = 1500;

export function useStudioAutosave() {
  const diagramId = useStudioStore((s) => s.diagramId);
  const nodes = useStudioStore((s) => s.nodes);
  const edges = useStudioStore((s) => s.edges);
  const title = useStudioStore((s) => s.title);
  const isInitialized = useStudioStore((s) => s.isInitialized);
  const setSaveStatus = useStudioStore((s) => s.setSaveStatus);
  const getDiagramJson = useStudioStore((s) => s.getDiagramJson);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!isInitialized || !diagramId) return;

    const payload = JSON.stringify({ nodes, edges, title });
    if (payload === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus("saving");

    timerRef.current = setTimeout(async () => {
      const result = await saveDiagramAction(
        diagramId,
        getDiagramJson(),
        title
      );
      if (result.error) {
        setSaveStatus("error");
      } else {
        lastSavedRef.current = payload;
        setSaveStatus("saved");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    nodes,
    edges,
    title,
    diagramId,
    isInitialized,
    setSaveStatus,
    getDiagramJson,
  ]);
}

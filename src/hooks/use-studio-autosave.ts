"use client";

import { useEffect, useRef } from "react";
import { saveDiagramAction } from "@/actions/diagram";
import { useStudioStore } from "@/store/studio-store";

const DEBOUNCE_MS = 2500;

export function useStudioAutosave() {
  const diagramId = useStudioStore((s) => s.diagramId);
  const diagramRevision = useStudioStore((s) => s.diagramRevision);
  const title = useStudioStore((s) => s.title);
  const isInitialized = useStudioStore((s) => s.isInitialized);
  const setSaveStatus = useStudioStore((s) => s.setSaveStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRevisionRef = useRef(-1);

  useEffect(() => {
    if (!isInitialized || !diagramId) return;
    lastRevisionRef.current = diagramRevision;
    setSaveStatus("saved");
  }, [isInitialized, diagramId, setSaveStatus]);

  useEffect(() => {
    if (!isInitialized || !diagramId) return;
    if (diagramRevision === lastRevisionRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus("saving");

    timerRef.current = setTimeout(async () => {
      const state = useStudioStore.getState();
      const result = await saveDiagramAction(
        diagramId,
        state.getDiagramJson(),
        state.title,
        { light: true }
      );
      if (result.error) {
        setSaveStatus("error");
      } else {
        lastRevisionRef.current = state.diagramRevision;
        setSaveStatus("saved");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [diagramRevision, title, diagramId, isInitialized, setSaveStatus]);
}

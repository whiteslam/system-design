import { create } from "zustand";
import type { BlueprintSection } from "@/types";

interface BlueprintStore {
  activeSection: BlueprintSection;
  setActiveSection: (section: BlueprintSection) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export const useBlueprintStore = create<BlueprintStore>((set) => ({
  activeSection: "overview",
  setActiveSection: (section) => set({ activeSection: section }),
  isGenerating: false,
  setIsGenerating: (value) => set({ isGenerating: value }),
}));

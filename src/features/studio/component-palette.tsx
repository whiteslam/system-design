"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  COMPONENT_CATALOG,
  getComponentsByCategory,
  type CatalogComponent,
} from "@/lib/diagram/component-catalog";
import { useStudioStore } from "@/store/studio-store";

function DraggableComponent({ item }: { item: CatalogComponent }) {
  const addComponentAtCenter = useStudioStore((s) => s.addComponentAtCenter);

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/archflow-component",
      JSON.stringify({
        id: item.id,
        label: item.label,
        type: item.type,
        color: item.color,
        description: item.description,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const addToCanvas = () => {
    addComponentAtCenter({
      id: item.id,
      label: item.label,
      type: item.type,
      color: item.color,
      description: item.description,
    });
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={addToCanvas}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          addToCanvas();
        }
      }}
      role="button"
      tabIndex={0}
      title={`${item.description} — click or drag to canvas`}
      className="flex cursor-grab items-center gap-2 rounded-xl border border-border/40 bg-secondary/40 px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary/10 active:cursor-grabbing"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{ backgroundColor: `${item.color}22`, color: item.color }}
      >
        {item.icon}
      </span>
      <span className="truncate text-xs font-medium">{item.label}</span>
    </div>
  );
}

interface ComponentPaletteProps {
  className?: string;
  onClose?: () => void;
}

export function ComponentPalette({ className, onClose }: ComponentPaletteProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const fuse = useMemo(
    () =>
      new Fuse(COMPONENT_CATALOG, {
        keys: ["label", "category", "description"],
        threshold: 0.35,
      }),
    []
  );

  const filtered = query
    ? fuse.search(query).map((r) => r.item)
    : null;

  const toggleCategory = (cat: string) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="border-b border-border/50 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Components</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
              aria-label="Close components panel"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {filtered ? (
          <div className="space-y-2">
            {filtered.map((item) => (
              <DraggableComponent key={item.id} item={item} />
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No components found
              </p>
            )}
          </div>
        ) : (
          CATEGORIES.map((category) => {
            const items = getComponentsByCategory(category);
            const isOpen = !collapsed[category];
            return (
              <motion.div key={category} className="mb-3">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {category}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-1 space-y-1.5 overflow-hidden"
                    >
                      {items.map((item) => (
                        <DraggableComponent key={item.id} item={item} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </aside>
  );
}

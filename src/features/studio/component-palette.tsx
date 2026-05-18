"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  COMPONENT_CATALOG,
  getComponentsByCategory,
  type CatalogComponent,
} from "@/lib/diagram/component-catalog";
import { cn } from "@/lib/utils";

function DraggableComponent({ item }: { item: CatalogComponent }) {
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

  return (
    <div
      draggable
      onDragStart={onDragStart}
      title={item.description}
      className="flex cursor-grab items-center gap-2 rounded-xl border border-border/40 bg-background/40 px-3 py-2 transition-all hover:border-primary/40 hover:bg-primary/5 active:cursor-grabbing"
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

export function ComponentPalette() {
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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl">
      <div className="border-b border-border/50 p-4">
        <h2 className="mb-3 text-sm font-semibold">Components</h2>
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

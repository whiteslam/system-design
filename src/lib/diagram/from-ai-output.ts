import type { AIDiagramOutput, DiagramJson, StudioEdge, StudioNode } from "@/types/diagram";

export function aiOutputToDiagram(output: AIDiagramOutput): DiagramJson {
  const nodes: StudioNode[] = output.nodes.map((n, i) => ({
    id: n.id,
    type: n.type,
    position: n.position ?? {
      x: 100 + (i % 4) * 280,
      y: 100 + Math.floor(i / 4) * 160,
    },
    data: {
      label: n.label,
      description: n.description,
      ...n.metadata,
    },
  }));

  const edges: StudioEdge[] = output.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    data: { edgeType: e.type, label: e.label },
  }));

  return {
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 0.75 },
  };
}

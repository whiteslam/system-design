import dagre from "dagre";
import type { StudioEdge, StudioNode } from "@/types/diagram";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 88;

export function applyAutoLayout(
  nodes: StudioNode[],
  edges: StudioEdge[],
  direction: "TB" | "LR" = "LR"
): StudioNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });
}

import type { DiagramJson } from "@/types/diagram";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";

export async function exportCanvasAsPng(
  element: HTMLElement,
  filename = "architecture.png"
) {
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    backgroundColor: "#030712",
    filter: (node) => {
      if (node instanceof HTMLElement) {
        return !node.classList?.contains("react-flow__minimap");
      }
      return true;
    },
  });
  downloadDataUrl(dataUrl, filename);
}

export async function exportCanvasAsSvg(
  element: HTMLElement,
  filename = "architecture.svg"
) {
  const dataUrl = await toSvg(element, {
    backgroundColor: "#030712",
  });
  downloadDataUrl(dataUrl, filename);
}

export function exportDiagramJson(diagram: DiagramJson, filename = "diagram.json") {
  const blob = new Blob([JSON.stringify(diagram, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

export function exportDiagramMarkdown(
  diagram: DiagramJson,
  title: string,
  filename = "architecture.md"
) {
  const lines = [
    `# ${title}`,
    "",
    "## Components",
    "",
    ...diagram.nodes.map(
      (n) => `- **${n.data.label}** (${n.type})${n.data.description ? `: ${n.data.description}` : ""}`
    ),
    "",
    "## Connections",
    "",
    ...diagram.edges.map((e) => {
      const src = diagram.nodes.find((n) => n.id === e.source)?.data.label ?? e.source;
      const tgt = diagram.nodes.find((n) => n.id === e.target)?.data.label ?? e.target;
      return `- ${src} → ${tgt} (${e.data?.edgeType ?? "api"})`;
    }),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  downloadBlob(blob, filename);
}

export async function exportCanvasAsPdf(
  element: HTMLElement,
  filename = "architecture.pdf"
) {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#030712",
  });
  const pdf = new jsPDF({ orientation: "landscape", unit: "px" });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
  pdf.save(filename);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

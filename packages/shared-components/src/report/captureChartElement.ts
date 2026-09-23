import html2canvas from "html2canvas-pro";
import {
  CHART_EXPORT_CAPTURING_ATTR,
  CHART_EXPORT_SCROLL_ATTR,
  shouldIgnoreChartExportElement,
} from "./chartExport.js";

/** CSS-pixel scale; 2x made zip-all of ~15 live cards too slow. */
const CHART_CAPTURE_SCALE = 1;

function expandScrollAreas(element: HTMLElement): () => void {
  const nodes = [
    element,
    ...Array.from(
      element.querySelectorAll<HTMLElement>(
        `[${CHART_EXPORT_SCROLL_ATTR}], .pf-v6-c-card, .pf-v6-c-card__body`,
      ),
    ),
  ];
  const previous = nodes.map((node) => ({
    node,
    overflow: node.style.overflow,
    maxHeight: node.style.maxHeight,
    height: node.style.height,
  }));

  for (const node of nodes) {
    node.style.overflow = "visible";
    node.style.maxHeight = "none";
    node.style.height = "auto";
  }

  return () => {
    for (const entry of previous) {
      entry.node.style.overflow = entry.overflow;
      entry.node.style.maxHeight = entry.maxHeight;
      entry.node.style.height = entry.height;
    }
  };
}

export async function captureChartElement(
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  const restoreScroll = expandScrollAreas(element);
  element.setAttribute(CHART_EXPORT_CAPTURING_ATTR, "");

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    const backgroundColor =
      window.getComputedStyle(element).backgroundColor || "#ffffff";
    return html2canvas(element, {
      useCORS: true,
      backgroundColor,
      logging: false,
      scale: CHART_CAPTURE_SCALE,
      imageTimeout: 0,
      ignoreElements: (node) =>
        node instanceof Element &&
        shouldIgnoreChartExportElement(node, element),
    });
  } finally {
    element.removeAttribute(CHART_EXPORT_CAPTURING_ATTR);
    restoreScroll();
  }
}

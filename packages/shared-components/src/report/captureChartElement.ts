import html2canvas from "html2canvas-pro";
import {
  CHART_EXPORT_CAPTURING_ATTR,
  CHART_EXPORT_SCROLL_ATTR,
  shouldIgnoreChartExportElement,
} from "./chartExport.js";

/** CSS-pixel scale; 2x made zip-all of ~15 live cards too slow. */
const CHART_CAPTURE_SCALE = 1;
const HIDDEN_LAYOUT_STYLE_KEYS = [
  "display",
  "position",
  "left",
  "top",
  "width",
  "maxHeight",
  "overflow",
  "zIndex",
] as const;

type HiddenLayoutStyleKey = (typeof HIDDEN_LAYOUT_STYLE_KEYS)[number];

type HiddenAncestorSnapshot = {
  node: HTMLElement;
  hidden: HTMLElement["hidden"];
  styles: Record<HiddenLayoutStyleKey, string>;
};

function isDisplayNone(node: HTMLElement): boolean {
  return window.getComputedStyle(node).display === "none";
}

/**
 * Tab panels stay mounted with `hidden` / `display:none` when another tab is
 * active. html2canvas then measures a 0×0 box. Reveal those ancestors off-screen
 * for the duration of the capture, then restore.
 */
export function revealHiddenChartAncestors(element: HTMLElement): () => void {
  const saved: HiddenAncestorSnapshot[] = [];
  let node: HTMLElement | null = element;

  while (node && node !== document.documentElement) {
    if (node.hidden || isDisplayNone(node)) {
      saved.push({
        node,
        hidden: node.hidden,
        styles: {
          display: node.style.display,
          position: node.style.position,
          left: node.style.left,
          top: node.style.top,
          width: node.style.width,
          maxHeight: node.style.maxHeight,
          overflow: node.style.overflow,
          zIndex: node.style.zIndex,
        },
      });
    }
    node = node.parentElement;
  }

  if (saved.length === 0) {
    return () => undefined;
  }

  const outermost = saved[saved.length - 1].node;
  const parentWidth = outermost.parentElement?.clientWidth ?? 0;
  const layoutWidth =
    parentWidth || document.documentElement.clientWidth || 1024;

  for (const entry of saved) {
    entry.node.hidden = false;
    entry.node.style.display = "block";
    entry.node.style.position = "fixed";
    entry.node.style.left = "-10000px";
    entry.node.style.top = "0";
    entry.node.style.width = `${layoutWidth}px`;
    entry.node.style.maxHeight = "none";
    entry.node.style.overflow = "visible";
    entry.node.style.zIndex = "-1";
  }

  return () => {
    for (const entry of saved) {
      entry.node.hidden = entry.hidden;
      for (const key of HIDDEN_LAYOUT_STYLE_KEYS) {
        entry.node.style[key] = entry.styles[key];
      }
    }
  };
}

const PADDED_CAPTURE_SELECTOR =
  ".pf-v6-c-card__title, .pf-v6-c-card__header, .pf-v6-c-card__body";

function applyComputedPadding(source: HTMLElement, dest: HTMLElement): void {
  const computed = window.getComputedStyle(source);
  dest.style.paddingTop = computed.paddingTop;
  dest.style.paddingRight = computed.paddingRight;
  dest.style.paddingBottom = computed.paddingBottom;
  dest.style.paddingLeft = computed.paddingLeft;
}

function copyComputedPadding(node: HTMLElement): {
  paddingTop: string;
  paddingRight: string;
  paddingBottom: string;
  paddingLeft: string;
} {
  const previous = {
    paddingTop: node.style.paddingTop,
    paddingRight: node.style.paddingRight,
    paddingBottom: node.style.paddingBottom,
    paddingLeft: node.style.paddingLeft,
  };
  applyComputedPadding(node, node);
  return previous;
}

function applyComputedPaddingToClone(
  sourceRoot: HTMLElement,
  clonedRoot: HTMLElement,
): void {
  const sources = sourceRoot.querySelectorAll<HTMLElement>(
    PADDED_CAPTURE_SELECTOR,
  );
  const dests = clonedRoot.querySelectorAll<HTMLElement>(
    PADDED_CAPTURE_SELECTOR,
  );
  sources.forEach((source, index) => {
    const dest = dests[index];
    if (dest) {
      applyComputedPadding(source, dest);
    }
  });
}

function prepareCaptureLayout(element: HTMLElement): () => void {
  const layoutNodes = [
    element,
    ...Array.from(
      element.querySelectorAll<HTMLElement>(
        `[${CHART_EXPORT_SCROLL_ATTR}], .pf-v6-c-card, .pf-v6-c-card__body`,
      ),
    ),
  ];
  const paddedNodes = Array.from(
    element.querySelectorAll<HTMLElement>(PADDED_CAPTURE_SELECTOR),
  );
  const previousLayout = layoutNodes.map((node) => ({
    node,
    overflow: node.style.getPropertyValue("overflow"),
    overflowPriority: node.style.getPropertyPriority("overflow"),
    maxHeight: node.style.maxHeight,
    height: node.style.height,
    borderRadius: node.style.borderRadius,
    boxShadow: node.style.boxShadow,
    clipPath: node.style.clipPath,
  }));
  const previousPadding = paddedNodes.map((node) => ({
    node,
    ...copyComputedPadding(node),
  }));

  for (const node of layoutNodes) {
    node.style.setProperty("overflow", "visible", "important");
    node.style.maxHeight = "none";
    node.style.height = "auto";
    node.style.borderRadius = "0";
    node.style.boxShadow = "none";
    node.style.clipPath = "none";
  }

  return () => {
    for (const entry of previousLayout) {
      if (entry.overflow) {
        entry.node.style.setProperty(
          "overflow",
          entry.overflow,
          entry.overflowPriority,
        );
      } else {
        entry.node.style.removeProperty("overflow");
      }
      entry.node.style.maxHeight = entry.maxHeight;
      entry.node.style.height = entry.height;
      entry.node.style.borderRadius = entry.borderRadius;
      entry.node.style.boxShadow = entry.boxShadow;
      entry.node.style.clipPath = entry.clipPath;
    }
    for (const entry of previousPadding) {
      entry.node.style.paddingTop = entry.paddingTop;
      entry.node.style.paddingRight = entry.paddingRight;
      entry.node.style.paddingBottom = entry.paddingBottom;
      entry.node.style.paddingLeft = entry.paddingLeft;
    }
  };
}

export async function captureChartElement(
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  const restoreHidden = revealHiddenChartAncestors(element);
  const restoreLayout = prepareCaptureLayout(element);
  element.setAttribute(CHART_EXPORT_CAPTURING_ATTR, "");

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    return html2canvas(element, {
      useCORS: true,
      backgroundColor: null,
      logging: false,
      scale: CHART_CAPTURE_SCALE,
      imageTimeout: 0,
      ignoreElements: (node) =>
        node instanceof Element &&
        shouldIgnoreChartExportElement(node, element),
      onclone: (_clonedDoc, clonedElement) => {
        applyComputedPaddingToClone(element, clonedElement);
      },
    });
  } finally {
    element.removeAttribute(CHART_EXPORT_CAPTURING_ATTR);
    restoreLayout();
    restoreHidden();
  }
}

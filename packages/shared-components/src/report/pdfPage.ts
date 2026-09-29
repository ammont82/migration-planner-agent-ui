export interface PdfExportSegment {
  top: number;
  height: number;
}

export function splitSegmentForPageHeight(
  segment: PdfExportSegment,
  imgHeight: number,
  pageHeightPx: number,
): PdfExportSegment[] {
  const total = Math.max(1, Math.min(segment.height, imgHeight - segment.top));
  if (pageHeightPx <= 0 || total <= pageHeightPx) {
    return [{ top: segment.top, height: total }];
  }

  const slices: PdfExportSegment[] = [];
  let offset = 0;
  while (offset < total) {
    const height = Math.min(pageHeightPx, total - offset);
    slices.push({ top: segment.top + offset, height });
    offset += height;
  }
  return slices;
}

export function fitPdfImageSize(
  pixelWidth: number,
  pixelHeight: number,
  maxWidthMm: number,
  maxHeightMm: number,
): { widthMm: number; heightMm: number } {
  const safeWidth = Math.max(1, pixelWidth);
  const safeHeight = Math.max(1, pixelHeight);
  const widthScale = maxWidthMm / safeWidth;
  const heightAtFullWidth = safeHeight * widthScale;
  if (heightAtFullWidth <= maxHeightMm) {
    return { widthMm: maxWidthMm, heightMm: heightAtFullWidth };
  }
  const scale = maxHeightMm / safeHeight;
  return { widthMm: safeWidth * scale, heightMm: maxHeightMm };
}

export function placePdfBlock(
  cursorY: number | null,
  blockHeightMm: number,
  pageTopMm: number,
  pageBottomMm: number,
): { y: number; needsNewPage: boolean } {
  if (cursorY === null || cursorY + blockHeightMm > pageBottomMm) {
    return { y: pageTopMm, needsNewPage: true };
  }
  return { y: cursorY, needsNewPage: false };
}

export function sliceCanvas(
  sourceCanvas: HTMLCanvasElement,
  width: number,
  height: number,
  offsetY: number,
  backgroundColor: string,
): HTMLCanvasElement {
  const pageCanvas = document.createElement("canvas");
  pageCanvas.width = width;
  pageCanvas.height = height;
  const context = pageCanvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context unavailable");
  }
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);
  context.drawImage(
    sourceCanvas,
    0,
    offsetY,
    width,
    height,
    0,
    0,
    width,
    height,
  );
  return pageCanvas;
}

import jsPDF from "jspdf";
import { type ChartCaptureSource, releaseCanvas } from "./chartExport.js";
import { fitPdfImageSize, placePdfBlock, sliceCanvas } from "./pdfPage.js";

const MARGIN_MM = 10;
const GAP_MM = 8;
/** Flatten captures onto white; jsPDF cannot embed transparent PNG alpha cleanly. */
const PAGE_BACKGROUND = "#ffffff";

export async function buildPdfFromCharts(
  charts: ChartCaptureSource[],
  documentTitle: string,
): Promise<Blob> {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_MM * 2;
  const contentHeight = pageHeight - MARGIN_MM * 2;
  const pageTop = MARGIN_MM;
  const pageBottom = pageHeight - MARGIN_MM;

  addCoverPage(
    pdf,
    documentTitle,
    charts.map((chart) => chart.title),
    pageWidth,
    pageHeight,
  );

  let cursorY: number | null = null;
  for (const chart of charts) {
    const canvas = await chart.capture();
    try {
      if (canvas.width < 1 || canvas.height < 1) {
        throw new Error("Chart capture produced an empty image");
      }
      const size = fitPdfImageSize(
        canvas.width,
        canvas.height,
        contentWidth,
        contentHeight,
      );
      const placement = placePdfBlock(
        cursorY,
        size.heightMm,
        pageTop,
        pageBottom,
      );
      if (placement.needsNewPage) {
        pdf.addPage();
      }
      addChartImage(
        pdf,
        canvas,
        MARGIN_MM + (contentWidth - size.widthMm) / 2,
        placement.y,
        size.widthMm,
        size.heightMm,
      );
      cursorY = placement.y + size.heightMm + GAP_MM;
    } finally {
      releaseCanvas(canvas);
    }
  }

  addPageNumbers(pdf, pageWidth, pageHeight);
  return pdf.output("blob");
}

function addCoverPage(
  pdf: jsPDF,
  documentTitle: string,
  tocItems: string[],
  pageWidth: number,
  pageHeight: number,
): void {
  const contentWidth = pageWidth - MARGIN_MM * 2;
  pdf.setFontSize(18);
  const titleLines = pdf.splitTextToSize(
    documentTitle,
    contentWidth,
  ) as string[];
  let titleY = MARGIN_MM + 8;
  for (const line of titleLines) {
    pdf.text(line, pageWidth / 2, titleY, { align: "center" });
    titleY += 8;
  }

  pdf.setFontSize(11);
  const generatedAt = new Date();
  pdf.text(
    `Generated: ${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString()}`,
    pageWidth / 2,
    titleY + 4,
    { align: "center" },
  );

  pdf.setFontSize(14);
  pdf.text("Table of contents", MARGIN_MM, titleY + 16);
  pdf.setFontSize(11);
  let tocY = titleY + 26;
  for (const item of tocItems) {
    if (tocY > pageHeight - MARGIN_MM - 10) {
      pdf.addPage();
      tocY = MARGIN_MM;
    }
    pdf.text(`- ${item}`, MARGIN_MM, tocY);
    tocY += 7;
  }
}

function addChartImage(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  widthMm: number,
  heightMm: number,
): void {
  const flattened = sliceCanvas(
    canvas,
    canvas.width,
    canvas.height,
    0,
    PAGE_BACKGROUND,
  );
  try {
    pdf.addImage(
      flattened.toDataURL("image/jpeg", 0.92),
      "JPEG",
      x,
      y,
      widthMm,
      heightMm,
    );
  } finally {
    releaseCanvas(flattened);
  }
}

function addPageNumbers(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
): void {
  const totalPages = pdf.getNumberOfPages();
  pdf.setFontSize(9);
  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);
    pdf.text(`Page ${page} of ${totalPages}`, pageWidth / 2, pageHeight - 6, {
      align: "center",
    });
  }
}

import { describe, expect, it, vi } from "vitest";
import { buildOverviewExportOptions } from "./reportExportOptions";

describe("buildOverviewExportOptions", () => {
  it("lists inventory exports before assessment report formats", () => {
    const onExportPdf = vi.fn();
    const onExportPng = vi.fn();
    const onExportHtml = vi.fn();
    const onExportCsv = vi.fn();
    const onExportXlsx = vi.fn();
    const onExportJsonZip = vi.fn();

    expect(
      buildOverviewExportOptions({
        onExportPdf,
        onExportPng,
        onExportHtml,
        onExportCsv,
        onExportXlsx,
        onExportJsonZip,
      }).map((option) => option.key),
    ).toEqual([
      "inventory-csv",
      "inventory-xlsx",
      "inventory-json-zip",
      "pdf",
      "html",
      "png",
    ]);
  });

  it("omits inventory exports when disabled for SaaS hosting", () => {
    expect(
      buildOverviewExportOptions({
        enableInventoryExports: false,
        onExportCsv: vi.fn(),
        onExportPdf: vi.fn(),
      }).map((option) => option.key),
    ).toEqual(["pdf"]);
  });
});

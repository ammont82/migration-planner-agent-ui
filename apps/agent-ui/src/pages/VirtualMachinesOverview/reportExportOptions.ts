import {
  REPORT_EXPORT_SECTION,
  type ReportExportOption,
  type StandardReportExportHandlers,
  standardReportExportOptions,
} from "@openshift-migration-advisor/shared-components";

export type InventoryExportHandlers = {
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
  onExportJsonZip?: () => void;
};

export type OverviewExportHandlers = StandardReportExportHandlers &
  InventoryExportHandlers & {
    enableInventoryExports?: boolean;
  };

export function buildOverviewExportOptions({
  enableInventoryExports = true,
  onExportCsv,
  onExportXlsx,
  onExportJsonZip,
  ...handlers
}: OverviewExportHandlers): ReportExportOption[] {
  const inventoryOptions: ReportExportOption[] = [];

  if (enableInventoryExports) {
    if (onExportCsv) {
      inventoryOptions.push({
        key: "inventory-csv",
        label: "CSV",
        onSelect: onExportCsv,
        section: REPORT_EXPORT_SECTION.inventory,
      });
    }
    if (onExportXlsx) {
      inventoryOptions.push({
        key: "inventory-xlsx",
        label: "XLSX",
        onSelect: onExportXlsx,
        section: REPORT_EXPORT_SECTION.inventory,
      });
    }
    if (onExportJsonZip) {
      inventoryOptions.push({
        key: "inventory-json-zip",
        label: "JSON (ZIP)",
        description:
          "Main inventory and group inventories for upload to the Migration Advisor console",
        onSelect: onExportJsonZip,
        section: REPORT_EXPORT_SECTION.inventory,
      });
    }
  }

  return [...inventoryOptions, ...standardReportExportOptions(handlers)];
}

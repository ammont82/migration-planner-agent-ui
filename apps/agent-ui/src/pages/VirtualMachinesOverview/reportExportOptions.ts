import {
  type ReportExportOption,
  type ReportExportSection,
  type StandardReportExportHandlers,
  standardReportExportOptions,
} from "@openshift-migration-advisor/shared-components";

export const OVERVIEW_INVENTORY_EXPORT_SECTION: ReportExportSection = {
  id: "inventory",
  label: "Inventory",
};

export type InventoryExportHandlers = {
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
  onExportJsonZip?: () => void;
};

export type OverviewExportHandlers = StandardReportExportHandlers &
  InventoryExportHandlers;

/**
 * Composes export menu rows for the VM overview. Inventory rows appear only when
 * the corresponding handlers are provided.
 */
export function buildOverviewExportOptions({
  onExportCsv,
  onExportXlsx,
  onExportJsonZip,
  ...handlers
}: OverviewExportHandlers): ReportExportOption[] {
  const inventoryOptions: ReportExportOption[] = [];
  const section = OVERVIEW_INVENTORY_EXPORT_SECTION;

  if (onExportCsv) {
    inventoryOptions.push({
      key: "inventory-csv",
      label: "CSV",
      onSelect: onExportCsv,
      section,
    });
  }
  if (onExportXlsx) {
    inventoryOptions.push({
      key: "inventory-xlsx",
      label: "XLSX",
      onSelect: onExportXlsx,
      section,
    });
  }
  if (onExportJsonZip) {
    inventoryOptions.push({
      key: "inventory-json-zip",
      label: "JSON (ZIP)",
      description:
        "Main inventory and group inventories for upload to the Migration Advisor console",
      onSelect: onExportJsonZip,
      section,
    });
  }

  return [...inventoryOptions, ...standardReportExportOptions(handlers)];
}

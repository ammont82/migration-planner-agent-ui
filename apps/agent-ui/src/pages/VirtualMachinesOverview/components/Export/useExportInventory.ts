import { useCallback, useRef, useState } from "react";
import type { DefaultApiInterface } from "../../../../api/agentApi";
import { downloadExportBlob, getExportFilename } from "./downloadExportBlob";
import {
  downloadInventoryJsonZip,
  fetchExportInventory,
} from "./exportInventoryApi";
import {
  DEFAULT_EXPORT_FORMAT,
  type ExportFormat,
  type ExportScopeId,
} from "./exportScopes";

type UseExportInventoryOptions = {
  hasCollectionData: boolean;
  hasInventory: boolean;
};

export function useExportInventory(
  agentApi: DefaultApiInterface,
  { hasCollectionData, hasInventory }: UseExportInventoryOptions,
) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modalInitialFormat, setModalInitialFormat] = useState<ExportFormat>(
    DEFAULT_EXPORT_FORMAT,
  );
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const isExportingRef = useRef(false);

  const showExport = hasCollectionData && hasInventory;

  const openExportModal = useCallback((format: ExportFormat = "xlsx") => {
    setExportError(null);
    setIsExporting(false);
    isExportingRef.current = false;
    setModalInitialFormat(format);
    setIsExportModalOpen(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setExportError(null);
    setIsExporting(false);
    isExportingRef.current = false;
    setIsExportModalOpen(false);
  }, []);

  const clearExportError = useCallback(() => {
    setExportError(null);
  }, []);

  const confirmExport = useCallback(
    async (scopes: ExportScopeId[], format: ExportFormat) => {
      if (isExportingRef.current) {
        return;
      }

      isExportingRef.current = true;
      setIsExporting(true);
      setExportError(null);

      try {
        const blob = await fetchExportInventory(agentApi, scopes, format);
        downloadExportBlob(blob, getExportFilename(format));
        setExportError(null);
        setIsExportModalOpen(false);
      } catch (err) {
        console.error("Error exporting inventory:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to export inventory. Please try again.";
        setExportError(errorMessage);
      } finally {
        isExportingRef.current = false;
        setIsExporting(false);
      }
    },
    [agentApi],
  );

  const exportJsonZip = useCallback(async () => {
    if (isExportingRef.current) {
      return;
    }

    isExportingRef.current = true;
    setIsExporting(true);
    setExportError(null);

    try {
      await downloadInventoryJsonZip(agentApi);
      setExportError(null);
    } catch (err) {
      console.error("Error exporting inventory JSON ZIP:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to export inventory. Please try again.";
      setExportError(errorMessage);
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
    }
  }, [agentApi]);

  return {
    isExportModalOpen,
    modalInitialFormat,
    showExport,
    exportError,
    isExporting,
    openExportModal,
    closeExportModal,
    clearExportError,
    confirmExport,
    exportJsonZip,
  };
}

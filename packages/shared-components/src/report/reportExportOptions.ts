export const REPORT_EXPORT_SECTION = {
  inventory: "inventory",
  assessmentReport: "assessment-report",
} as const;

export type ReportExportSectionId =
  (typeof REPORT_EXPORT_SECTION)[keyof typeof REPORT_EXPORT_SECTION];

export const REPORT_EXPORT_SECTION_LABELS: Record<
  ReportExportSectionId,
  string
> = {
  [REPORT_EXPORT_SECTION.inventory]: "Inventory",
  [REPORT_EXPORT_SECTION.assessmentReport]: "Assessment report",
};

export interface ReportExportOption {
  key: string;
  label: string;
  description?: string;
  onSelect: () => void;
  isDisabled?: boolean;
  section?: ReportExportSectionId;
}

export interface StandardReportExportHandlers {
  onExportPdf?: () => void;
  onExportPng?: () => void;
  onExportHtml?: () => void;
}

/**
 * Standard report-download actions. Omit a handler to hide that format.
 */
export const standardReportExportOptions = ({
  onExportPdf,
  onExportPng,
  onExportHtml,
}: StandardReportExportHandlers): ReportExportOption[] => {
  const options: ReportExportOption[] = [];

  if (onExportPdf) {
    options.push({
      key: "pdf",
      label: "PDF",
      onSelect: onExportPdf,
      section: REPORT_EXPORT_SECTION.assessmentReport,
    });
  }

  if (onExportHtml) {
    options.push({
      key: "html",
      label: "HTML",
      onSelect: onExportHtml,
      section: REPORT_EXPORT_SECTION.assessmentReport,
    });
  }

  if (onExportPng) {
    options.push({
      key: "png",
      label: "PNG",
      onSelect: onExportPng,
      section: REPORT_EXPORT_SECTION.assessmentReport,
    });
  }

  return options;
};

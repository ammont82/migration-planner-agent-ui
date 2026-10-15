export interface ReportExportSection {
  id: string;
  label: string;
}

export interface ReportExportOption {
  key: string;
  label: string;
  description?: string;
  onSelect: () => void;
  isDisabled?: boolean;
  /** When set, the menu groups rows and shows `label` as the group heading. */
  section?: ReportExportSection;
}

export interface StandardReportExportHandlers {
  onExportPdf?: () => void;
  onExportPng?: () => void;
  onExportHtml?: () => void;
}

export type StandardReportExportOptionsConfig = StandardReportExportHandlers & {
  /** Dropdown group label for PDF / HTML / PNG. Default: `"Assessment report"`. */
  assessmentSectionLabel?: string;
};

const DEFAULT_ASSESSMENT_SECTION: ReportExportSection = {
  id: "assessment-report",
  label: "Assessment report",
};

/**
 * Optional helper for chart-based assessment downloads. Omit a handler to hide
 * that format. Override `assessmentSectionLabel` if product copy differs per app.
 */
export const standardReportExportOptions = ({
  onExportPdf,
  onExportPng,
  onExportHtml,
  assessmentSectionLabel,
}: StandardReportExportOptionsConfig): ReportExportOption[] => {
  const section: ReportExportSection = assessmentSectionLabel
    ? { ...DEFAULT_ASSESSMENT_SECTION, label: assessmentSectionLabel }
    : DEFAULT_ASSESSMENT_SECTION;

  const options: ReportExportOption[] = [];

  if (onExportPdf) {
    options.push({
      key: "pdf",
      label: "PDF",
      onSelect: onExportPdf,
      section,
    });
  }

  if (onExportHtml) {
    options.push({
      key: "html",
      label: "HTML",
      onSelect: onExportHtml,
      section,
    });
  }

  if (onExportPng) {
    options.push({
      key: "png",
      label: "PNG",
      onSelect: onExportPng,
      section,
    });
  }

  return options;
};

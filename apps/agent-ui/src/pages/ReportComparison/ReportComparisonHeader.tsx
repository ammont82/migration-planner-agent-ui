import { Button, Content, Title } from "@patternfly/react-core";
import { ExportIcon, SyncAltIcon } from "@patternfly/react-icons";
import type React from "react";
import { formatReportRunDate } from "./comparisonFormatting";

interface ReportComparisonHeaderProps {
  latestReportRun?: Date | null;
  showRunNewReport?: boolean;
  isCollecting?: boolean;
  onRunNewReportClick?: () => void;
  showExport?: boolean;
  onExportClick?: () => void;
  isExporting?: boolean;
  description?: React.ReactNode;
}

export const ReportComparisonHeader: React.FC<ReportComparisonHeaderProps> = ({
  latestReportRun = null,
  showRunNewReport = false,
  isCollecting = false,
  onRunNewReportClick,
  showExport = false,
  onExportClick,
  isExporting = false,
  description,
}) => {
  const canRunNewReport = showRunNewReport && Boolean(onRunNewReportClick);
  const canExport = showExport && Boolean(onExportClick);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      <div>
        <Title headingLevel="h1" size="2xl">
          Report comparison
        </Title>
        {latestReportRun ? (
          <Content component="p" style={{ marginTop: "8px" }}>
            Latest report run: {formatReportRunDate(latestReportRun)}
          </Content>
        ) : null}
        {description ? (
          <Content component="p" style={{ marginTop: "8px" }}>
            {description}
          </Content>
        ) : null}
      </div>
      {canRunNewReport || canExport ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          {canRunNewReport ? (
            <Button
              variant="secondary"
              onClick={onRunNewReportClick}
              icon={<SyncAltIcon />}
              isDisabled={isCollecting}
            >
              Run new report
            </Button>
          ) : null}
          {canExport ? (
            <Button
              variant="link"
              onClick={onExportClick}
              icon={<ExportIcon />}
              isLoading={isExporting}
              isDisabled={isExporting}
            >
              Export To report as ZIP
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

ReportComparisonHeader.displayName = "ReportComparisonHeader";

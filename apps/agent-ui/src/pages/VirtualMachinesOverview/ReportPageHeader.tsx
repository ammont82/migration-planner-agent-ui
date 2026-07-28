import { Button, Content, Title } from "@patternfly/react-core";
import { ExportIcon, SyncAltIcon } from "@patternfly/react-icons";
import type React from "react";

interface ReportPageHeaderProps {
  discoveryStatus: string;
  latestReportRun?: Date | null;
  showRunNewReport?: boolean;
  isCollecting?: boolean;
  onRunNewReportClick?: () => void;
  showExport?: boolean;
  onExportClick?: () => void;
}

export const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({
  discoveryStatus,
  latestReportRun = null,
  showRunNewReport = false,
  isCollecting = false,
  onRunNewReportClick,
  showExport = false,
  onExportClick,
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
          Virtual machines overview
        </Title>
        <Content component="p" style={{ marginTop: "8px" }}>
          Discovery VM status: {discoveryStatus}
        </Content>
        {latestReportRun ? (
          <Content component="p" style={{ marginTop: "4px" }}>
            Latest report run: {latestReportRun.toLocaleString()}
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
            >
              Export as CSV
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

ReportPageHeader.displayName = "ReportPageHeader";

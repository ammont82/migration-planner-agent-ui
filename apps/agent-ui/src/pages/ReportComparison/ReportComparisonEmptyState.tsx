import { Button } from "@patternfly/react-core";
import { HistoryIcon } from "@patternfly/react-icons";
import type React from "react";
import { AppEmptyState } from "../../common/components";

interface ReportComparisonEmptyStateProps {
  reportCount: number;
  onRunNewReportClick?: () => void;
  isCollecting?: boolean;
}

export const ReportComparisonEmptyState: React.FC<
  ReportComparisonEmptyStateProps
> = ({ reportCount, onRunNewReportClick, isCollecting = false }) => {
  const body =
    reportCount === 0 ? (
      <>
        No reports are available yet. Run a report to capture an infrastructure
        snapshot before comparing changes over time.
      </>
    ) : (
      <>
        You need at least two reports to compare data. Run a second report to
        capture a fresh snapshot and track infrastructure changes over time.
      </>
    );

  return (
    <AppEmptyState
      titleText="No comparison data available yet"
      icon={HistoryIcon}
      body={body}
    >
      {onRunNewReportClick ? (
        <Button
          variant="primary"
          onClick={onRunNewReportClick}
          isDisabled={isCollecting}
        >
          Run new report
        </Button>
      ) : null}
    </AppEmptyState>
  );
};

ReportComparisonEmptyState.displayName = "ReportComparisonEmptyState";

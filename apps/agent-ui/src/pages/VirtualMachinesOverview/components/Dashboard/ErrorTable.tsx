import type { MigrationIssue } from "@openshift-migration-advisor/agent-sdk";
import {
  ChartHeaderActions,
  chartExportRootStyle,
  dashboardStyles,
  useRegisterChart,
} from "@openshift-migration-advisor/shared-components";
import {
  Card,
  CardBody,
  CardTitle,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Icon,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import type React from "react";
import { AppEmptyState } from "../../../../common/components";
import { ReportTable } from "../../../Groups/components/ReportTable";

interface ErrorTableProps {
  errors: MigrationIssue[];
  onConcernClick?: (concernLabel: string) => void;
}

export const ErrorTable: React.FC<ErrorTableProps> = ({
  errors,
  onConcernClick,
}) => {
  const handleRowClick = (issue: MigrationIssue) => {
    if (issue.label && onConcernClick) {
      onConcernClick(issue.label);
    }
  };

  const chartId = "errors-table";
  const chartTitle = "Errors";
  const chartRef = useRegisterChart({ id: chartId, title: chartTitle });

  return (
    <div ref={chartRef} style={chartExportRootStyle}>
      <Card className={dashboardStyles.card} id={chartId}>
        <CardTitle>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <FlexItem>
              <Icon status="danger">
                <ExclamationCircleIcon />
              </Icon>{" "}
              Errors
            </FlexItem>
            <ChartHeaderActions chartId={chartId} title={chartTitle} />
          </Flex>
        </CardTitle>
        <CardBody className={dashboardStyles.cardBodyScrollable}>
          {errors.length === 0 ? (
            <AppEmptyState
              titleText="No errors found"
              status="success"
              variant={EmptyStateVariant.xs}
              wrapInBullseye={false}
            />
          ) : (
            <div>
              <ReportTable<MigrationIssue>
                data={errors}
                columns={["Description", "Total VMs"]}
                fields={["assessment", "count"]}
                onRowClick={onConcernClick ? handleRowClick : undefined}
                clickableFields={onConcernClick ? ["assessment"] : []}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

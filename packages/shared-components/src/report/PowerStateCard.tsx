import { Card, CardBody, CardTitle } from "@patternfly/react-core";
import type { FC, ReactNode } from "react";
import {
  MigrationDonutChart,
  type MigrationDonutChartDatum,
  type MigrationDonutChartLegendVariant,
} from "../charts/MigrationDonutChart.js";
import { CardEmptyState } from "./CardEmptyState.js";
import { dashboardStyles } from "./dashboardStyles.js";

export interface PowerStateCardProps {
  id: string;
  title: string;
  icon: ReactNode;
  emptyTitle: string;
  slices: MigrationDonutChartDatum[];
  legend: Record<string, string>;
  total: number;
  subTitle: string;
  isExportMode?: boolean;
  itemsPerRow?: number;
  legendVariant?: MigrationDonutChartLegendVariant;
}

export const PowerStateCard: FC<PowerStateCardProps> = ({
  id,
  title,
  icon,
  emptyTitle,
  slices,
  legend,
  total,
  subTitle,
  isExportMode = false,
  itemsPerRow = 2,
  legendVariant = "html",
}) => (
  <Card
    className={isExportMode ? dashboardStyles.cardPrint : dashboardStyles.card}
    id={id}
  >
    <CardTitle>
      {icon} {title}
    </CardTitle>
    <CardBody>
      {total === 0 ? (
        <CardEmptyState title={emptyTitle} />
      ) : (
        <MigrationDonutChart
          legendVariant={legendVariant}
          data={slices}
          legend={legend}
          height={300}
          width={420}
          donutThickness={18}
          padAngle={1}
          title={`${total}`}
          subTitle={subTitle}
          subTitleColor="var(--pf-t--global--text--color--subtle)"
          titleFontSize={34}
          labelFontSize={16}
          itemsPerRow={itemsPerRow}
          marginLeft="0%"
          tooltipLabelFormatter={({ datum, percent }) =>
            `${datum.countDisplay}\n${percent.toFixed(1)}%`
          }
        />
      )}
    </CardBody>
  </Card>
);

PowerStateCard.displayName = "PowerStateCard";

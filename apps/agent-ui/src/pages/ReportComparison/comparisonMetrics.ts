import type {
  CollectionComparisonDiffDimensionEnum,
  CollectionComparisonSummaryDiff,
  ComparisonDiffEntry,
} from "@openshift-migration-advisor/agent-sdk";

export type ComparisonMetricKey =
  | "migratable"
  | "nonMigratable"
  | "totalVMs"
  | "clusters";

export const COMPARISON_METRICS: Array<{
  key: ComparisonMetricKey;
  label: string;
  summaryLabel: string;
  dimension?: CollectionComparisonDiffDimensionEnum;
  supportsDrawer: boolean;
}> = [
  {
    key: "migratable",
    label: "Migratable VMs",
    summaryLabel: "Migratable",
    dimension: "migratable",
    supportsDrawer: true,
  },
  {
    key: "nonMigratable",
    label: "Non-migratable VMs",
    summaryLabel: "Non-migratable",
    dimension: "non-migratable",
    supportsDrawer: true,
  },
  {
    key: "totalVMs",
    label: "Total VMs",
    summaryLabel: "Total VMs",
    dimension: "total",
    supportsDrawer: true,
  },
  {
    key: "clusters",
    label: "Clusters",
    summaryLabel: "Clusters",
    supportsDrawer: false,
  },
];

export function getMetricDiffEntry(
  diff: CollectionComparisonSummaryDiff,
  key: ComparisonMetricKey,
) {
  return diff[key];
}

export function metricHasDrawerDetails(entry: ComparisonDiffEntry): boolean {
  return (
    entry.delta !== 0 || (entry.onlyInA ?? 0) > 0 || (entry.onlyInB ?? 0) > 0
  );
}

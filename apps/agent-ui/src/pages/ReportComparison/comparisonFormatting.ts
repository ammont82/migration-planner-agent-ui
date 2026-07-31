import type { Collection } from "@openshift-migration-advisor/agent-sdk";

export function formatReportRunDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReportRunShortDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCollectionOptionLabel(
  collection: Collection,
  isLatest: boolean,
): string {
  const label = formatReportRunDate(collection.createdAt);
  return isLatest ? `${label} (Latest)` : label;
}

const deltaFormatter = new Intl.NumberFormat(undefined, {
  signDisplay: "exceptZero",
});

export function formatDelta(value: number): string {
  return deltaFormatter.format(value);
}

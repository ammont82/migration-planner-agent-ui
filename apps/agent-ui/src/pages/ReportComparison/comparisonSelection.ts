import type { Collection } from "@openshift-migration-advisor/agent-sdk";

export function pickDefaultComparisonIds(
  collections: Pick<Collection, "id">[],
): { fromId: string; toId: string } | null {
  if (collections.length < 2) {
    return null;
  }

  return {
    fromId: collections[1]?.id ?? "",
    toId: collections[0]?.id ?? "",
  };
}

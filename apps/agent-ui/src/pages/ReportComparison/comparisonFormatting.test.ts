import { describe, expect, it } from "vitest";
import {
  formatCollectionOptionLabel,
  formatDelta,
} from "./comparisonFormatting";

describe("comparisonFormatting", () => {
  it("formats positive deltas with a plus sign", () => {
    expect(formatDelta(2)).toBe("+2");
    expect(formatDelta(0)).toBe("0");
    expect(formatDelta(-1)).toBe("-1");
  });

  it("marks the latest collection in option labels", () => {
    const createdAt = new Date("2026-07-31T10:00:00.000Z");
    const label = formatCollectionOptionLabel(
      { id: "c1", name: "latest", createdAt },
      true,
    );
    expect(label).toContain("(Latest)");
  });
});

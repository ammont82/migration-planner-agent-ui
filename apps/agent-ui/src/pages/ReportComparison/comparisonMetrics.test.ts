import { describe, expect, it } from "vitest";
import { metricHasDrawerDetails } from "./comparisonMetrics";

describe("metricHasDrawerDetails", () => {
  it("returns true when delta is non-zero", () => {
    expect(metricHasDrawerDetails({ delta: 2 })).toBe(true);
    expect(metricHasDrawerDetails({ delta: -1 })).toBe(true);
  });

  it("returns true when onlyInA or onlyInB counts are present", () => {
    expect(metricHasDrawerDetails({ delta: 0, onlyInA: 1 })).toBe(true);
    expect(metricHasDrawerDetails({ delta: 0, onlyInB: 2 })).toBe(true);
  });

  it("returns false when there is no diff activity", () => {
    expect(metricHasDrawerDetails({ delta: 0 })).toBe(false);
    expect(metricHasDrawerDetails({ delta: 0, onlyInA: 0, onlyInB: 0 })).toBe(
      false,
    );
  });
});

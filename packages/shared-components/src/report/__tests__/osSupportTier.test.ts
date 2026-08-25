import { describe, expect, it } from "vitest";

import {
  getSupportTierBadgeInlineStyle,
  getSupportTierDefinition,
  getSupportTierLegendLabel,
  getSupportTierSortOrder,
  hasOsUpgradeNotice,
  resolveSupportTier,
  SUPPORT_TIER_DEFINITIONS,
  SupportTier,
} from "../osSupportTier.js";

describe("osSupportTier", () => {
  it("maps API tier values to display labels", () => {
    expect(getSupportTierLegendLabel(SupportTier.Certified)).toBe("Certified");
    expect(getSupportTierLegendLabel(SupportTier.VendorSupported)).toBe(
      "Commercial Vendor Supported",
    );
    expect(getSupportTierLegendLabel(SupportTier.CommunitySupported)).toBe(
      "Community supported",
    );
    expect(getSupportTierLegendLabel(SupportTier.SpecialHandling)).toBe(
      "Special handling",
    );
  });

  it("orders tiers from best to worst support", () => {
    expect(getSupportTierSortOrder(SupportTier.Certified)).toBeLessThan(
      getSupportTierSortOrder(SupportTier.VendorSupported),
    );
    expect(getSupportTierSortOrder(SupportTier.VendorSupported)).toBeLessThan(
      getSupportTierSortOrder(SupportTier.CommunitySupported),
    );
    expect(
      getSupportTierSortOrder(SupportTier.CommunitySupported),
    ).toBeLessThan(getSupportTierSortOrder(SupportTier.SpecialHandling));
  });

  it("uses support tier when present", () => {
    expect(resolveSupportTier(SupportTier.CommunitySupported, true)).toBe(
      SupportTier.CommunitySupported,
    );
  });

  it("falls back to certified when supportTier is missing and supported is true", () => {
    expect(resolveSupportTier(undefined, true)).toBe(SupportTier.Certified);
  });

  it("falls back to special handling when supportTier is missing and supported is false", () => {
    expect(resolveSupportTier(undefined, false)).toBe(
      SupportTier.SpecialHandling,
    );
  });

  it("provides official Red Hat definitions for each support tier", () => {
    expect(getSupportTierDefinition(SupportTier.Certified)).toBe(
      SUPPORT_TIER_DEFINITIONS[SupportTier.Certified],
    );
    expect(getSupportTierDefinition(SupportTier.VendorSupported)).toContain(
      "commercial vendor supported guest operating system",
    );
    expect(getSupportTierDefinition(SupportTier.CommunitySupported)).toContain(
      "community channels",
    );
    expect(getSupportTierDefinition(SupportTier.SpecialHandling)).toContain(
      "third-party software support policy",
    );
  });

  it("provides explicit inline badge colors for PDF export", () => {
    expect(getSupportTierBadgeInlineStyle(SupportTier.Certified)).toEqual({
      backgroundColor: "#b9dafc",
      color: "#004d99",
    });
  });

  it("detects when the upgrade notice should be shown", () => {
    expect(
      hasOsUpgradeNotice({
        "Red Hat Enterprise Linux 9 (64-bit)": {
          count: 1,
          supported: true,
          supportTier: SupportTier.Certified,
          upgradeRecommendation: "",
        },
      }),
    ).toBe(false);

    expect(
      hasOsUpgradeNotice({
        "CentOS 7 (64-bit)": {
          count: 1,
          supported: false,
          supportTier: SupportTier.SpecialHandling,
          upgradeRecommendation: "",
        },
      }),
    ).toBe(true);
  });
});

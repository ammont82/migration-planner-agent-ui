import { css } from "@emotion/css";
import { Label, Tooltip } from "@patternfly/react-core";
import type { FC } from "react";
import {
  getSupportTierBadgeColor,
  getSupportTierBadgeInlineStyle,
  getSupportTierDefinition,
  getSupportTierLegendLabel,
  type SupportTier,
} from "./osSupportTier.js";

const exportBadgeStyle = css`
  display: inline-block;
  padding: var(--pf-t--global--spacer--xs) var(--pf-t--global--spacer--sm);
  border-radius: var(--pf-t--global--border--radius--pill);
  font-size: var(--pf-t--global--font--size--body--sm);
  line-height: var(--pf-t--global--font--line-height--body);
  white-space: nowrap;
`;

interface SupportTierBadgeProps {
  tier: SupportTier;
  isExportMode?: boolean;
}

const ExportSupportTierBadge: FC<{ tier: SupportTier }> = ({ tier }) => {
  const { backgroundColor, color } = getSupportTierBadgeInlineStyle(tier);

  return (
    <span className={exportBadgeStyle} style={{ backgroundColor, color }}>
      {getSupportTierLegendLabel(tier)}
    </span>
  );
};

export const SupportTierBadge: FC<SupportTierBadgeProps> = ({
  tier,
  isExportMode = false,
}) => {
  if (isExportMode) {
    return <ExportSupportTierBadge tier={tier} />;
  }

  return (
    <Tooltip content={getSupportTierDefinition(tier)}>
      <span>
        <Label color={getSupportTierBadgeColor(tier)} isCompact>
          {getSupportTierLegendLabel(tier)}
        </Label>
      </span>
    </Tooltip>
  );
};

SupportTierBadge.displayName = "SupportTierBadge";

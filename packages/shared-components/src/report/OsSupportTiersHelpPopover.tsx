import {
  Button,
  Content,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import type { FC } from "react";
import {
  getSupportTierBadgeColor,
  getSupportTierDefinition,
  getSupportTierLegendLabel,
  ORDERED_SUPPORT_TIERS,
  SUPPORT_TIER_LEARN_MORE_URL,
} from "./osSupportTier.js";
import PopoverIcon from "./PopoverIcon.js";

const OsSupportTiersHelpBody: FC = () => (
  <Stack hasGutter>
    {ORDERED_SUPPORT_TIERS.map((tier) => (
      <StackItem key={tier}>
        <Label color={getSupportTierBadgeColor(tier)} isCompact>
          {getSupportTierLegendLabel(tier)}
        </Label>
        <Content component="p">{getSupportTierDefinition(tier)}</Content>
      </StackItem>
    ))}
    <StackItem>
      <Button
        variant="link"
        isInline
        component="a"
        href={SUPPORT_TIER_LEARN_MORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        icon={<ExternalLinkAltIcon />}
        iconPosition="end"
        aria-label="Learn more about operating system support tiers"
      >
        Learn more
      </Button>
    </StackItem>
  </Stack>
);

export const OsSupportTiersHelpPopover: FC = () => (
  <PopoverIcon
    noVerticalAlign
    maxWidth="40rem"
    headerContent="Guest OS support tiers"
    bodyContent={<OsSupportTiersHelpBody />}
    buttonOuiaId="guest-os-support-tiers-help"
    aria-label="Guest OS support tiers help"
  />
);

OsSupportTiersHelpPopover.displayName = "OsSupportTiersHelpPopover";

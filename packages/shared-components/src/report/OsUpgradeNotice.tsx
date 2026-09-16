import { Content, Flex, FlexItem, Icon } from "@patternfly/react-core";
import { InfoCircleIcon } from "@patternfly/react-icons";
import type { FC } from "react";

export const OsUpgradeNotice: FC = () => (
  <Flex
    alignItems={{ default: "alignItemsCenter" }}
    spaceItems={{ default: "spaceItemsSm" }}
  >
    <FlexItem>
      <Icon status="info">
        <InfoCircleIcon />
      </Icon>
    </FlexItem>
    <FlexItem>
      <Content component="p">
        Some operating systems may need upgrades before migration
      </Content>
    </FlexItem>
  </Flex>
);

OsUpgradeNotice.displayName = "OsUpgradeNotice";

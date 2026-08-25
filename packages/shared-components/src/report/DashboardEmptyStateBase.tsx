import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import type { ComponentType, FC, SVGProps } from "react";

export interface DashboardEmptyStateBaseProps {
  title: string;
  body: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export const DashboardEmptyStateBase: FC<DashboardEmptyStateBaseProps> = ({
  title,
  body,
  icon: IconComponent = SearchIcon,
}) => (
  <EmptyState
    headingLevel="h4"
    icon={IconComponent}
    titleText={title}
    variant={EmptyStateVariant.sm}
  >
    <EmptyStateBody>{body}</EmptyStateBody>
  </EmptyState>
);

DashboardEmptyStateBase.displayName = "DashboardEmptyStateBase";

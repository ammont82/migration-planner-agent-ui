import type { FC } from "react";
import { DashboardEmptyStateBase } from "./DashboardEmptyStateBase.js";

export interface EmptySearchResultsProps {
  title?: string;
  body?: string;
}

export const EmptySearchResults: FC<EmptySearchResultsProps> = ({
  title = "No results found",
  body = "To continue, adjust your search or filters and try again",
}) => <DashboardEmptyStateBase title={title} body={body} />;

EmptySearchResults.displayName = "EmptySearchResults";

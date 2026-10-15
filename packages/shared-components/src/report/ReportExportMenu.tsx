import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  Spinner,
} from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { type FC, type ReactNode, type Ref, useMemo, useState } from "react";
import {
  type ReportExportOption,
  type ReportExportSection,
  type StandardReportExportHandlers,
  standardReportExportOptions,
} from "./reportExportOptions.js";

function sectionGroupKey(section?: ReportExportSection): string | undefined {
  return section?.id;
}

function groupExportOptions(options: ReportExportOption[]): {
  section?: ReportExportSection;
  options: ReportExportOption[];
}[] {
  const groups: {
    section?: ReportExportSection;
    options: ReportExportOption[];
  }[] = [];

  for (const option of options) {
    const sectionKey = sectionGroupKey(option.section);
    const last = groups.length > 0 ? groups[groups.length - 1] : undefined;
    const lastKey = last ? sectionGroupKey(last.section) : undefined;
    if (last && lastKey === sectionKey) {
      last.options.push(option);
    } else {
      groups.push({ section: option.section, options: [option] });
    }
  }

  return groups;
}

export interface ReportExportMenuProps {
  options: ReportExportOption[];
  isLoading?: boolean;
  loadingLabel?: string | null;
  isDisabled?: boolean;
  toggleLabel?: string;
}

export const ReportExportMenu: FC<ReportExportMenuProps> = ({
  options,
  isLoading = false,
  loadingLabel = null,
  isDisabled = false,
  toggleLabel = "Export",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const optionGroups = useMemo(() => groupExportOptions(options), [options]);

  if (options.length === 0) {
    return null;
  }

  const menuItems: ReactNode[] = [];
  optionGroups.forEach((group, index) => {
    if (index > 0) {
      const dividerKey =
        group.section?.id ?? group.options[0]?.key ?? "ungrouped";
      menuItems.push(
        <Divider key={`divider-before-${dividerKey}`} component="li" />,
      );
    }

    const items = group.options.map((option) => (
      <DropdownItem
        key={option.key}
        isDisabled={option.isDisabled}
        description={option.description}
        onClick={option.onSelect}
      >
        {option.label}
      </DropdownItem>
    ));

    if (group.section) {
      menuItems.push(
        <DropdownGroup key={group.section.id} label={group.section.label}>
          {items}
        </DropdownGroup>,
      );
    } else {
      menuItems.push(...items);
    }
  });

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      popperProps={{
        placement: "bottom-end",
        preventOverflow: true,
      }}
      onSelect={() => {
        setIsDropdownOpen(false);
      }}
      onOpenChange={(isOpen: boolean) => {
        setIsDropdownOpen(isOpen);
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setIsDropdownOpen((open) => !open);
          }}
          isExpanded={isDropdownOpen}
          variant="secondary"
          isDisabled={isLoading || isDisabled}
          aria-label="Export report options"
          icon={
            isLoading ? (
              <Spinner size="sm" aria-hidden="true" />
            ) : (
              <DownloadIcon aria-hidden="true" />
            )
          }
        >
          {isLoading ? (loadingLabel ?? "Generating...") : toggleLabel}
        </MenuToggle>
      )}
    >
      <DropdownList>{menuItems}</DropdownList>
    </Dropdown>
  );
};

ReportExportMenu.displayName = "ReportExportMenu";

export interface ExportReportButtonProps extends StandardReportExportHandlers {
  extraOptions?: ReportExportOption[];
  isLoading?: boolean;
  loadingLabel?: string | null;
  isDisabled?: boolean;
  toggleLabel?: string;
  assessmentSectionLabel?: string;
}

export const ExportReportButton: FC<ExportReportButtonProps> = ({
  onExportPdf,
  onExportPng,
  onExportHtml,
  extraOptions = [],
  assessmentSectionLabel,
  ...menuProps
}) => (
  <ReportExportMenu
    options={[
      ...standardReportExportOptions({
        onExportPdf,
        onExportPng,
        onExportHtml,
        assessmentSectionLabel,
      }),
      ...extraOptions,
    ]}
    {...menuProps}
  />
);

ExportReportButton.displayName = "ExportReportButton";

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
  REPORT_EXPORT_SECTION_LABELS,
  type ReportExportOption,
  type ReportExportSectionId,
  type StandardReportExportHandlers,
  standardReportExportOptions,
} from "./reportExportOptions.js";

function groupExportOptions(
  options: ReportExportOption[],
): { sectionId?: ReportExportSectionId; options: ReportExportOption[] }[] {
  const groups: {
    sectionId?: ReportExportSectionId;
    options: ReportExportOption[];
  }[] = [];

  for (const option of options) {
    const sectionId = option.section;
    const last = groups.length > 0 ? groups[groups.length - 1] : undefined;
    if (last && last.sectionId === sectionId) {
      last.options.push(option);
    } else {
      groups.push({ sectionId, options: [option] });
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
      const dividerKey = group.sectionId ?? group.options[0]?.key ?? "flat";
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

    if (group.sectionId) {
      menuItems.push(
        <DropdownGroup
          key={group.sectionId}
          label={REPORT_EXPORT_SECTION_LABELS[group.sectionId]}
        >
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
}

export const ExportReportButton: FC<ExportReportButtonProps> = ({
  onExportPdf,
  onExportPng,
  onExportHtml,
  extraOptions = [],
  ...menuProps
}) => (
  <ReportExportMenu
    options={[
      ...standardReportExportOptions({
        onExportPdf,
        onExportPng,
        onExportHtml,
      }),
      ...extraOptions,
    ]}
    {...menuProps}
  />
);

ExportReportButton.displayName = "ExportReportButton";

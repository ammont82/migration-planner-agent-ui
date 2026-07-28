import { Button, Content, Title } from "@patternfly/react-core";
import { ExportIcon } from "@patternfly/react-icons";
import type React from "react";

interface ReportPageHeaderProps {
  discoveryStatus: string;
  onExportClick: () => void;
}

export const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({
  discoveryStatus,
  onExportClick,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      <div>
        <Title headingLevel="h1" size="2xl">
          Virtual machines overview
        </Title>
        <Content component="p" style={{ marginTop: "8px" }}>
          Discovery VM status: {discoveryStatus}
        </Content>
      </div>
      <Button variant="link" onClick={onExportClick} icon={<ExportIcon />}>
        Export
      </Button>
    </div>
  );
};

ReportPageHeader.displayName = "ReportPageHeader";

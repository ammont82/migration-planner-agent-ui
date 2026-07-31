import { useInjection } from "@migration-planner-ui/ioc";
import type { CollectionComparisonSummary } from "@openshift-migration-advisor/agent-sdk";
import {
  Alert,
  AlertActionCloseButton,
  Content,
  PageSection,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAgentStatus } from "../../common/AgentStatusContext";
import type { DefaultApiInterface } from "../../common/agentApi";
import { listCollectionsNewestFirst } from "../../common/collectionApi";
import { fetchCollectionComparison } from "../../common/collectionComparisonApi";
import { getCollectionProgressInfo } from "../../common/collectionProgress";
import { CollectionProgress } from "../../common/components";
import { Symbols } from "../../main/Symbols";
import { downloadExportBlob } from "../VirtualMachinesOverview/components/Export/downloadExportBlob";
import { RunNewReportModal } from "../VirtualMachinesOverview/components/RunNewReport/RunNewReportModal";
import { useRunNewReport } from "../VirtualMachinesOverview/components/RunNewReport/useRunNewReport";
import { pickDefaultComparisonIds } from "./comparisonSelection";
import { ReportComparisonEmptyState } from "./ReportComparisonEmptyState";
import { ReportComparisonHeader } from "./ReportComparisonHeader";
import { ReportComparisonView } from "./ReportComparisonView";

export const ReportComparisonPage: React.FC = () => {
  const agentApi = useInjection<DefaultApiInterface>(Symbols.AgentApi);
  const { hasCollectionData, refetch: refetchAgentStatus } = useAgentStatus();
  const [collections, setCollections] = useState<
    Awaited<ReturnType<typeof listCollectionsNewestFirst>>
  >([]);
  const [comparison, setComparison] =
    useState<CollectionComparisonSummary | null>(null);
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canCompare = collections.length >= 2;

  const reloadCollections = useCallback(async () => {
    const nextCollections = await listCollectionsNewestFirst(agentApi);
    setCollections(nextCollections);
    return nextCollections;
  }, [agentApi]);

  const handleReportRefreshCompleted = useCallback(async () => {
    const nextCollections = await reloadCollections();
    await refetchAgentStatus();
    if (nextCollections.length >= 2) {
      const defaults = pickDefaultComparisonIds(nextCollections);
      if (defaults) {
        setFromId(defaults.fromId);
        setToId(defaults.toId);
      }
    }
  }, [refetchAgentStatus, reloadCollections]);

  const {
    latestReportRun,
    isModalOpen: isRunNewReportModalOpen,
    isCollecting,
    collectorStatus,
    showReadyAlert,
    collectError,
    openModal: openRunNewReportModal,
    closeModal: closeRunNewReportModal,
    confirmRun: confirmRunNewReport,
    dismissReadyAlert,
    dismissCollectError,
  } = useRunNewReport(agentApi, {
    onCompleted: handleReportRefreshCompleted,
  });

  const collectionProgress = getCollectionProgressInfo(
    collectorStatus,
    collectError,
  );

  useEffect(() => {
    let cancelled = false;

    const loadCollections = async () => {
      setLoading(true);
      setCollectionError(null);
      try {
        const nextCollections = await reloadCollections();
        if (cancelled) {
          return;
        }
        if (nextCollections.length >= 2) {
          const defaults = pickDefaultComparisonIds(nextCollections);
          if (defaults) {
            setFromId(defaults.fromId);
            setToId(defaults.toId);
          }
        }
      } catch (err) {
        console.error("Error loading collections:", err);
        if (!cancelled) {
          setCollectionError(
            err instanceof Error
              ? err.message
              : "Failed to load report collections.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCollections();
    return () => {
      cancelled = true;
    };
  }, [reloadCollections]);

  useEffect(() => {
    if (!canCompare || !fromId || !toId || fromId === toId) {
      setComparison(null);
      return;
    }

    let cancelled = false;

    const loadComparison = async () => {
      setComparisonLoading(true);
      setComparisonError(null);
      try {
        const summary = await fetchCollectionComparison(agentApi, fromId, toId);
        if (!cancelled) {
          setComparison(summary);
        }
      } catch (err) {
        console.error("Error loading report comparison:", err);
        if (!cancelled) {
          setComparison(null);
          setComparisonError(
            err instanceof Error
              ? err.message
              : "Failed to load report comparison.",
          );
        }
      } finally {
        if (!cancelled) {
          setComparisonLoading(false);
        }
      }
    };

    void loadComparison();
    return () => {
      cancelled = true;
    };
  }, [agentApi, canCompare, fromId, toId]);

  const headerDescription = useMemo(() => {
    if (!canCompare) {
      return null;
    }
    return (
      <>
        Compare migration metrics between 2 reports for{" "}
        <strong>All clusters</strong>. Excluded virtual machines will not be
        included in the comparison.
      </>
    );
  }, [canCompare]);

  const handleExportComparison = useCallback(async () => {
    if (!toId) {
      return;
    }

    setIsExporting(true);
    setExportError(null);
    try {
      const blob = await agentApi.exportCollection({
        id: toId,
        scope: "overview",
      });
      downloadExportBlob(blob, `report-comparison-${toId}.zip`);
    } catch (err) {
      console.error("Error exporting comparison:", err);
      setExportError(
        err instanceof Error
          ? err.message
          : "Failed to export comparison. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [agentApi, toId]);

  if (loading) {
    return (
      <PageSection hasBodyWrapper={false} isFilled style={{ padding: "24px" }}>
        <Content component="p">Loading report comparison...</Content>
      </PageSection>
    );
  }

  return (
    <PageSection hasBodyWrapper={false} isFilled style={{ padding: "24px" }}>
      <Stack hasGutter>
        <StackItem>
          <ReportComparisonHeader
            latestReportRun={latestReportRun}
            showRunNewReport={hasCollectionData}
            isCollecting={isCollecting}
            onRunNewReportClick={openRunNewReportModal}
            showExport={canCompare}
            onExportClick={handleExportComparison}
            isExporting={isExporting}
            description={headerDescription}
          />
        </StackItem>

        {isCollecting ? (
          <StackItem>
            <Alert variant="info" isInline title="Running a new vSphere report">
              <Content component="p">
                Capturing a fresh snapshot can take a few minutes.
              </Content>
              {collectionProgress.statusText ? (
                <CollectionProgress
                  percentage={collectionProgress.percentage}
                  statusText={collectionProgress.statusText}
                />
              ) : null}
            </Alert>
          </StackItem>
        ) : null}

        {showReadyAlert && !isCollecting ? (
          <StackItem>
            <Alert
              variant="success"
              isInline
              title="New report ready"
              actionClose={
                <AlertActionCloseButton onClose={dismissReadyAlert} />
              }
            >
              Your migration report now reflects the latest infrastructure
              snapshot.
            </Alert>
          </StackItem>
        ) : null}

        {collectError && !isCollecting ? (
          <StackItem>
            <Alert
              variant="danger"
              isInline
              title="New report failed"
              actionClose={
                <AlertActionCloseButton onClose={dismissCollectError} />
              }
            >
              {collectError}
            </Alert>
          </StackItem>
        ) : null}

        {exportError ? (
          <StackItem>
            <Alert
              variant="danger"
              isInline
              title="Export failed"
              actionClose={
                <AlertActionCloseButton onClose={() => setExportError(null)} />
              }
            >
              {exportError}
            </Alert>
          </StackItem>
        ) : null}

        {collectionError ? (
          <StackItem>
            <Alert variant="danger" isInline title="Error loading reports">
              {collectionError}
            </Alert>
          </StackItem>
        ) : null}

        {comparisonError ? (
          <StackItem>
            <Alert variant="danger" isInline title="Error loading comparison">
              {comparisonError}
            </Alert>
          </StackItem>
        ) : null}

        {!canCompare ? (
          <StackItem>
            <ReportComparisonEmptyState
              reportCount={collections.length}
              onRunNewReportClick={openRunNewReportModal}
              isCollecting={isCollecting}
            />
          </StackItem>
        ) : null}

        {canCompare && comparison && !comparisonLoading ? (
          <StackItem>
            <ReportComparisonView
              collections={collections}
              comparison={comparison}
              fromId={fromId}
              toId={toId}
              onFromChange={setFromId}
              onToChange={setToId}
            />
          </StackItem>
        ) : null}

        {canCompare && comparisonLoading ? (
          <StackItem>
            <Content component="p">Loading comparison data...</Content>
          </StackItem>
        ) : null}
      </Stack>

      <RunNewReportModal
        isOpen={isRunNewReportModalOpen}
        onConfirm={confirmRunNewReport}
        onCancel={closeRunNewReportModal}
      />
    </PageSection>
  );
};

ReportComparisonPage.displayName = "ReportComparisonPage";

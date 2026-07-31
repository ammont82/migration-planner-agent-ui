import type {
  Collection,
  CollectionComparisonSummary,
} from "@openshift-migration-advisor/agent-sdk";
import {
  Button,
  Card,
  CardBody,
  Content,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Flex,
  FlexItem,
  FormGroup,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import type React from "react";
import { useMemo, useState } from "react";
import { ComparisonDetailsDrawer } from "./ComparisonDetailsDrawer";
import {
  formatCollectionOptionLabel,
  formatDelta,
  formatReportRunShortDate,
} from "./comparisonFormatting";
import {
  COMPARISON_METRICS,
  type ComparisonMetricKey,
  getMetricDiffEntry,
  metricHasDrawerDetails,
} from "./comparisonMetrics";

interface ReportComparisonViewProps {
  collections: Collection[];
  comparison: CollectionComparisonSummary;
  fromId: string;
  toId: string;
  onFromChange: (collectionId: string) => void;
  onToChange: (collectionId: string) => void;
}

export const ReportComparisonView: React.FC<ReportComparisonViewProps> = ({
  collections,
  comparison,
  fromId,
  toId,
  onFromChange,
  onToChange,
}) => {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [drawerMetric, setDrawerMetric] = useState<ComparisonMetricKey | null>(
    null,
  );

  const latestCollectionId = collections[0]?.id;
  const fromCollection = collections.find((item) => item.id === fromId);
  const toCollection = collections.find((item) => item.id === toId);
  const fromAggregate =
    comparison.collections.find((item) => item.id === fromId) ??
    comparison.collections[0];
  const toAggregate =
    comparison.collections.find((item) => item.id === toId) ??
    comparison.collections[1];

  const fromOptions = useMemo(
    () =>
      collections.filter(
        (collection) => collection.id !== toId || collection.id === fromId,
      ),
    [collections, fromId, toId],
  );
  const toOptions = useMemo(
    () =>
      collections.filter(
        (collection) => collection.id !== fromId || collection.id === toId,
      ),
    [collections, fromId, toId],
  );

  const drawerMetricConfig = drawerMetric
    ? COMPARISON_METRICS.find((item) => item.key === drawerMetric)
    : undefined;
  const drawerDelta = drawerMetric
    ? getMetricDiffEntry(comparison.diff, drawerMetric).delta
    : 0;

  const panelContent =
    drawerMetric &&
    fromCollection &&
    toCollection &&
    drawerMetricConfig?.supportsDrawer ? (
      <ComparisonDetailsDrawer
        key={`${drawerMetric}-${fromId}-${toId}`}
        aId={fromId}
        bId={toId}
        aDate={fromCollection.createdAt}
        bDate={toCollection.createdAt}
        metricKey={drawerMetric}
        delta={drawerDelta}
        onClose={() => setDrawerMetric(null)}
      />
    ) : null;

  return (
    <Drawer isExpanded={drawerMetric !== null} isInline position="end">
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <Stack hasGutter>
            <StackItem>
              <Card>
                <CardBody>
                  <Flex
                    alignItems={{ default: "alignItemsFlexEnd" }}
                    gap={{ default: "gapLg" }}
                    flexWrap={{ default: "wrap" }}
                  >
                    <FlexItem flex={{ default: "flex_1" }}>
                      <FormGroup label="From" fieldId="comparison-from">
                        <Select
                          id="comparison-from"
                          isOpen={fromOpen}
                          selected={fromId}
                          onSelect={(_event, selection) => {
                            if (typeof selection === "string") {
                              onFromChange(selection);
                            }
                            setFromOpen(false);
                          }}
                          onOpenChange={setFromOpen}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setFromOpen((open) => !open)}
                              isExpanded={fromOpen}
                              style={{ width: "100%" }}
                            >
                              {fromCollection
                                ? formatCollectionOptionLabel(
                                    fromCollection,
                                    fromCollection.id === latestCollectionId,
                                  )
                                : "Select report"}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            {fromOptions.map((collection) => (
                              <SelectOption
                                key={collection.id}
                                value={collection.id}
                              >
                                {formatCollectionOptionLabel(
                                  collection,
                                  collection.id === latestCollectionId,
                                )}
                              </SelectOption>
                            ))}
                          </SelectList>
                        </Select>
                      </FormGroup>
                    </FlexItem>
                    <FlexItem flex={{ default: "flex_1" }}>
                      <FormGroup label="To" fieldId="comparison-to">
                        <Select
                          id="comparison-to"
                          isOpen={toOpen}
                          selected={toId}
                          onSelect={(_event, selection) => {
                            if (typeof selection === "string") {
                              onToChange(selection);
                            }
                            setToOpen(false);
                          }}
                          onOpenChange={setToOpen}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setToOpen((open) => !open)}
                              isExpanded={toOpen}
                              style={{ width: "100%" }}
                            >
                              {toCollection
                                ? formatCollectionOptionLabel(
                                    toCollection,
                                    toCollection.id === latestCollectionId,
                                  )
                                : "Select report"}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            {toOptions.map((collection) => (
                              <SelectOption
                                key={collection.id}
                                value={collection.id}
                              >
                                {formatCollectionOptionLabel(
                                  collection,
                                  collection.id === latestCollectionId,
                                )}
                              </SelectOption>
                            ))}
                          </SelectList>
                        </Select>
                      </FormGroup>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            </StackItem>

            <StackItem>
              <Card>
                <CardBody>
                  <Content component="h2" style={{ marginBottom: "16px" }}>
                    Virtual machine changes between reports
                  </Content>
                  <Flex
                    justifyContent={{ default: "justifyContentSpaceBetween" }}
                    flexWrap={{ default: "wrap" }}
                    gap={{ default: "gapLg" }}
                  >
                    {COMPARISON_METRICS.map((metric) => {
                      const entry = getMetricDiffEntry(
                        comparison.diff,
                        metric.key,
                      );
                      const canOpenDrawer =
                        metric.supportsDrawer && metricHasDrawerDetails(entry);

                      return (
                        <FlexItem key={metric.key}>
                          <Content component="small">
                            {metric.summaryLabel}
                          </Content>
                          {canOpenDrawer ? (
                            <Button
                              variant="link"
                              isInline
                              onClick={() => setDrawerMetric(metric.key)}
                              style={{
                                fontSize:
                                  "var(--pf-t--global--font--size--heading--h1)",
                                fontWeight: "bold",
                                textDecoration: "underline dotted",
                                padding: 0,
                              }}
                            >
                              {formatDelta(entry.delta)}
                            </Button>
                          ) : (
                            <Content
                              component="p"
                              style={{
                                fontSize:
                                  "var(--pf-t--global--font--size--heading--h1)",
                                fontWeight: "bold",
                                margin: 0,
                              }}
                            >
                              {formatDelta(entry.delta)}
                            </Content>
                          )}
                        </FlexItem>
                      );
                    })}
                  </Flex>
                </CardBody>
              </Card>
            </StackItem>

            <StackItem>
              <Card>
                <CardBody>
                  <Content component="h2" style={{ marginBottom: "16px" }}>
                    Comparison details
                  </Content>
                  <Table
                    variant="compact"
                    aria-label="Report comparison details"
                  >
                    <Thead>
                      <Tr>
                        <Th>Metric</Th>
                        <Th>
                          {fromCollection
                            ? formatReportRunShortDate(fromCollection.createdAt)
                            : "From"}
                        </Th>
                        <Th>
                          {toCollection
                            ? formatReportRunShortDate(toCollection.createdAt)
                            : "To"}
                        </Th>
                        <Th>Change</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {COMPARISON_METRICS.map((metric) => {
                        const entry = getMetricDiffEntry(
                          comparison.diff,
                          metric.key,
                        );
                        const valueA =
                          metric.key === "totalVMs"
                            ? fromAggregate.totalVMs
                            : metric.key === "migratable"
                              ? fromAggregate.migratable
                              : metric.key === "nonMigratable"
                                ? fromAggregate.nonMigratable
                                : fromAggregate.clusters;
                        const valueB =
                          metric.key === "totalVMs"
                            ? toAggregate.totalVMs
                            : metric.key === "migratable"
                              ? toAggregate.migratable
                              : metric.key === "nonMigratable"
                                ? toAggregate.nonMigratable
                                : toAggregate.clusters;

                        return (
                          <Tr key={metric.key}>
                            <Td>{metric.label}</Td>
                            <Td>{valueA}</Td>
                            <Td>{valueB}</Td>
                            <Td>{formatDelta(entry.delta)}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </StackItem>
          </Stack>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

ReportComparisonView.displayName = "ReportComparisonView";

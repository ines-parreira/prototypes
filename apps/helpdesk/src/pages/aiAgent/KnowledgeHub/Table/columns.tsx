import { SegmentEvent } from '@repo/logging'

import type { DataTableColumnDef, SortingState } from '@gorgias/axiom'
import {
    DataTableBaseCell,
    Icon,
    Loader,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { copilotAnchorProps } from 'copilot/uiActions'

import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { TitleCell } from './TitleCell'

import styles from './KnowledgeHubTable.less'

export type SyncStatusData = {
    syncingUrls: string[]
    domainSyncStatus: string | undefined
    failedUrls: string[]
}

export const COLUMN_IDS = {
    TITLE: 'title',
    LAST_UPDATED_AT: 'lastUpdatedAt',
    IN_USE_BY_AI: 'inUseByAI',
    METRICS_TICKETS: 'metrics.tickets',
    METRICS_HANDOVER_TICKETS: 'metrics.handoverTickets',
    METRICS_CSAT: 'metrics.csat',
} as const

export const METRICS_COLUMN_PREFIX = 'metrics.' as const

// Helper component for custom sortable column headers
const SortableHeader = ({
    label,
    columnId,
    sortState,
    onSort,
}: {
    label: string
    columnId: string
    sortState?: SortingState
    onSort?: (columnId: string) => void
}) => {
    if (!onSort) {
        return <span>{label}</span>
    }

    const currentSort = sortState?.[0]
    const isSorted = currentSort?.id === columnId
    const sortDirection = isSorted ? (currentSort.desc ? 'desc' : 'asc') : null
    const getAriaLabel = () => {
        if (isSorted) {
            if (sortDirection === 'asc') {
                return `Sorted by ${label} ascending`
            }
            return `Sorted by ${label} descending`
        }

        return `Sorted by ${label}`
    }

    return (
        <button
            onClick={() => onSort(columnId)}
            className={styles.sortableColumnHeader}
            type="button"
            aria-label={getAriaLabel()}
        >
            <span>{label}</span>
            <span className={styles.sortIndicator}>
                <Icon
                    size="xs"
                    name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'}
                />
            </span>
        </button>
    )
}

export const getColumns = (
    searchTerm: string = '',
    columnOnClick?: (data: GroupedKnowledgeItem) => void,
    availableActions: GuidanceAction[] = [],
    guidanceHelpCenterId?: number | null,
    metricsDateRange?: { start_datetime: string; end_datetime: string },
    outcomeCustomFieldId?: number,
    intentCustomFieldId?: number,
    isMetricsLoading: boolean = false,
    shopIntegrationId?: number,
    // New parameters for custom sorting
    sortState?: SortingState,
    onColumnSort?: (columnId: string) => void,
    syncStatusData?: SyncStatusData,
    selectedArticleId?: string,
    selectedArticleType?: string,
): DataTableColumnDef<GroupedKnowledgeItem>[] => {
    // Base columns - always present
    const baseColumns: DataTableColumnDef<GroupedKnowledgeItem>[] = [
        {
            id: COLUMN_IDS.TITLE,
            accessorKey: COLUMN_IDS.TITLE,
            size: 300,
            minSize: 300,
            header: () => (
                <SortableHeader
                    label="Title"
                    columnId={COLUMN_IDS.TITLE}
                    sortState={sortState}
                    onSort={onColumnSort}
                />
            ),
            cell: (info) => {
                const isSelectedArticle =
                    !!selectedArticleId &&
                    !!selectedArticleType &&
                    info.row.original.id === selectedArticleId &&
                    info.row.original.type === selectedArticleType

                const anchorProps =
                    info.row.original.type === KnowledgeType.Guidance
                        ? copilotAnchorProps({
                              type: 'guidance',
                              id: info.row.original.id,
                          })
                        : undefined

                return (
                    <DataTableBaseCell
                        {...info}
                        flexDirection="row"
                        alignItems="center"
                        data-selected-article={
                            isSelectedArticle ? 'true' : undefined
                        }
                        {...anchorProps}
                    >
                        <TitleCell
                            row={info.row}
                            searchTerm={searchTerm}
                            columnOnClick={columnOnClick}
                            availableActions={availableActions}
                            guidanceHelpCenterId={guidanceHelpCenterId}
                        />
                    </DataTableBaseCell>
                )
            },
        },
    ]

    // Metric columns - only included when metricsDateRange is provided
    const metricColumns: DataTableColumnDef<GroupedKnowledgeItem>[] =
        metricsDateRange
            ? [
                  {
                      id: COLUMN_IDS.METRICS_TICKETS,
                      accessorKey: COLUMN_IDS.METRICS_TICKETS,
                      header: () => (
                          <SortableHeader
                              label="Tickets"
                              columnId={COLUMN_IDS.METRICS_TICKETS}
                              sortState={sortState}
                              onSort={onColumnSort}
                          />
                      ),
                      size: 106,
                      minSize: 91,
                      isInteractive: true,
                      cell: (info) => {
                          const renderContent = () => {
                              if (info.row.original.isGrouped) {
                                  return <Text>--</Text>
                              }

                              if (isMetricsLoading) {
                                  return <Skeleton width={40} />
                              }

                              const metrics = info.row.original.metrics
                              const row = info.row.original

                              if (
                                  !metrics ||
                                  metrics.tickets === null ||
                                  metrics.tickets === undefined
                              ) {
                                  return <Text>--</Text>
                              }

                              // Create drilldown metric data for opening the drilldown modal
                              const drillDownMetricData =
                                  metrics && metricsDateRange
                                      ? {
                                            metricName: KnowledgeMetric.Tickets,
                                            title: 'Tickets',
                                            resourceSourceId: Number(row.id),
                                            resourceSourceSetId:
                                                metrics.resourceSourceSetId,
                                            shopIntegrationId:
                                                shopIntegrationId,
                                            dateRange: metricsDateRange,
                                            ...(outcomeCustomFieldId && {
                                                outcomeCustomFieldId,
                                            }),
                                            ...(intentCustomFieldId && {
                                                intentCustomFieldId,
                                            }),
                                        }
                                      : null

                              return (
                                  <DrillDownModalTrigger
                                      enabled={
                                          !!drillDownMetricData &&
                                          metrics.tickets > 0
                                      }
                                      highlighted={true}
                                      metricData={drillDownMetricData!}
                                      segmentEventName={
                                          SegmentEvent.AiAgentTicketDrilldownClicked
                                      }
                                  >
                                      <Text>{metrics.tickets}</Text>
                                  </DrillDownModalTrigger>
                              )
                          }

                          return (
                              <DataTableBaseCell {...info} isInteractive>
                                  {renderContent()}
                              </DataTableBaseCell>
                          )
                      },
                  },
                  {
                      id: COLUMN_IDS.METRICS_HANDOVER_TICKETS,
                      accessorKey: COLUMN_IDS.METRICS_HANDOVER_TICKETS,
                      header: () => (
                          <SortableHeader
                              label="Handover tickets"
                              columnId={COLUMN_IDS.METRICS_HANDOVER_TICKETS}
                              sortState={sortState}
                              onSort={onColumnSort}
                          />
                      ),
                      size: 147,
                      minSize: 134,
                      isInteractive: true,
                      cell: (info) => {
                          const renderContent = () => {
                              if (info.row.original.isGrouped) {
                                  return <Text>--</Text>
                              }

                              if (isMetricsLoading) {
                                  return <Skeleton width={40} />
                              }

                              const metrics = info.row.original.metrics
                              const row = info.row.original

                              if (
                                  !metrics ||
                                  metrics.handoverTickets === null ||
                                  metrics.handoverTickets === undefined
                              ) {
                                  return <Text>--</Text>
                              }

                              // Create drilldown metric data for opening the drilldown modal
                              const drillDownMetricData =
                                  metrics && metricsDateRange
                                      ? {
                                            metricName:
                                                KnowledgeMetric.HandoverTickets,
                                            title: 'Handover tickets',
                                            resourceSourceId: Number(row.id),
                                            resourceSourceSetId:
                                                metrics.resourceSourceSetId,
                                            shopIntegrationId:
                                                shopIntegrationId,
                                            dateRange: metricsDateRange,
                                            ...(outcomeCustomFieldId && {
                                                outcomeCustomFieldId,
                                            }),
                                            ...(intentCustomFieldId && {
                                                intentCustomFieldId,
                                            }),
                                        }
                                      : null

                              return (
                                  <DrillDownModalTrigger
                                      enabled={
                                          !!drillDownMetricData &&
                                          metrics.handoverTickets > 0
                                      }
                                      highlighted={true}
                                      metricData={drillDownMetricData!}
                                      segmentEventName={
                                          SegmentEvent.AiAgentTicketDrilldownClicked
                                      }
                                  >
                                      <Text>{metrics.handoverTickets}</Text>
                                  </DrillDownModalTrigger>
                              )
                          }

                          return (
                              <DataTableBaseCell {...info} isInteractive>
                                  {renderContent()}
                              </DataTableBaseCell>
                          )
                      },
                  },
                  {
                      id: COLUMN_IDS.METRICS_CSAT,
                      accessorKey: COLUMN_IDS.METRICS_CSAT,
                      header: () => (
                          <SortableHeader
                              label="CSAT"
                              columnId={COLUMN_IDS.METRICS_CSAT}
                              sortState={sortState}
                              onSort={onColumnSort}
                          />
                      ),
                      size: 106,
                      minSize: 93,
                      isInteractive: true,
                      cell: (info) => {
                          const renderContent = () => {
                              if (info.row.original.isGrouped) {
                                  return <Text>--</Text>
                              }

                              if (isMetricsLoading) {
                                  return <Skeleton width={40} />
                              }

                              const metrics = info.row.original.metrics
                              const row = info.row.original
                              const csat = metrics?.csat

                              if (csat === null || csat === undefined) {
                                  return <Text>--</Text>
                              }

                              // Create drilldown metric data for opening the drilldown modal
                              const drillDownMetricData =
                                  metrics && metricsDateRange
                                      ? {
                                            metricName: KnowledgeMetric.CSAT,
                                            title: 'Average CSAT',
                                            resourceSourceId: Number(row.id),
                                            resourceSourceSetId:
                                                metrics.resourceSourceSetId,
                                            shopIntegrationId:
                                                shopIntegrationId,
                                            dateRange: metricsDateRange,
                                            ...(outcomeCustomFieldId && {
                                                outcomeCustomFieldId,
                                            }),
                                            ...(intentCustomFieldId && {
                                                intentCustomFieldId,
                                            }),
                                        }
                                      : null
                              const formattedCsat = Number.isInteger(csat)
                                  ? csat.toString()
                                  : csat.toFixed(1)

                              return (
                                  <DrillDownModalTrigger
                                      enabled={!!drillDownMetricData}
                                      highlighted={true}
                                      metricData={drillDownMetricData!}
                                      segmentEventName={
                                          SegmentEvent.AiAgentTicketDrilldownClicked
                                      }
                                  >
                                      <Text>{formattedCsat}</Text>
                                  </DrillDownModalTrigger>
                              )
                          }

                          return (
                              <DataTableBaseCell {...info} isInteractive>
                                  {renderContent()}
                              </DataTableBaseCell>
                          )
                      },
                  },
              ]
            : []

    // End columns - always present
    const endColumns: DataTableColumnDef<GroupedKnowledgeItem>[] = [
        {
            id: 'lastUpdatedAt',
            accessorKey: 'lastUpdatedAt',
            size: 126,
            minSize: 126,
            header: () => (
                <SortableHeader
                    label="Last updated"
                    columnId="lastUpdatedAt"
                    sortState={sortState}
                    onSort={onColumnSort}
                />
            ),
            cell: (info) => {
                const date = info.getValue() as string
                return (
                    <DataTableBaseCell {...info}>
                        <Text>{new Date(date).toLocaleDateString()}</Text>
                    </DataTableBaseCell>
                )
            },
        },
        {
            id: 'inUseByAI',
            accessorKey: 'inUseByAI',
            size: 153,
            minSize: 148,
            header: () => (
                <SortableHeader
                    label="In use by AI Agent"
                    columnId="inUseByAI"
                    sortState={sortState}
                    onSort={onColumnSort}
                />
            ),
            cell: (info) => {
                const renderContent = () => {
                    const isGrouped = info.row.original.isGrouped
                    const row = info.row.original

                    if (isGrouped) {
                        const isSyncing =
                            (row.type === KnowledgeType.URL &&
                                syncStatusData?.syncingUrls.includes(
                                    row.source ?? '',
                                )) ||
                            (row.type === KnowledgeType.Domain &&
                                syncStatusData?.domainSyncStatus === 'PENDING')

                        if (isSyncing) {
                            return (
                                <Tooltip
                                    delay={0}
                                    trigger={() => (
                                        <span
                                            className={styles.syncStatusTrigger}
                                        >
                                            <Loader size="sm" />
                                        </span>
                                    )}
                                >
                                    <TooltipContent caption="Syncing in progress..." />
                                </Tooltip>
                            )
                        }

                        const isFailed =
                            (row.type === KnowledgeType.URL &&
                                syncStatusData?.failedUrls.includes(
                                    row.source ?? '',
                                )) ||
                            (row.type === KnowledgeType.Domain &&
                                syncStatusData?.domainSyncStatus === 'FAILED')

                        if (isFailed && row.itemCount && row.itemCount > 0) {
                            return (
                                <Tooltip
                                    delay={0}
                                    trigger={() => (
                                        <span
                                            className={styles.syncStatusTrigger}
                                        >
                                            <Icon
                                                name="warning-triangle"
                                                size="sm"
                                                color="content-error-default"
                                            />
                                        </span>
                                    )}
                                >
                                    <TooltipContent caption="Sync failed - using previous content" />
                                </Tooltip>
                            )
                        }

                        return <Text>--</Text>
                    }

                    // For FAQ and Guidance articles, check both conditions:
                    // 1. Article must have a published version (not only draft)
                    // 2. Article must have public visibility
                    let isInUse: boolean
                    if (
                        row.type === KnowledgeType.FAQ ||
                        row.type === KnowledgeType.Guidance
                    ) {
                        isInUse =
                            !!row.publishedVersionId &&
                            row.inUseByAI === KnowledgeVisibility.PUBLIC
                    } else {
                        // For other types, use visibility status
                        const visibility = info.getValue() as
                            | KnowledgeVisibility
                            | undefined
                        isInUse = visibility === KnowledgeVisibility.PUBLIC
                    }

                    return isInUse ? (
                        <Icon
                            name="check"
                            size="md"
                            color="content-success-default"
                        />
                    ) : (
                        <Icon
                            name="close"
                            size="md"
                            color="content-neutral-tertiary"
                        />
                    )
                }

                return (
                    <DataTableBaseCell
                        {...info}
                        alignItems="center"
                        justifyContent="flex-start"
                    >
                        {renderContent()}
                    </DataTableBaseCell>
                )
            },
        },
    ]

    return [...baseColumns, ...metricColumns, ...endColumns]
}

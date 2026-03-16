import { SegmentEvent } from '@repo/logging'

import type { ColumnDef, SortingState } from '@gorgias/axiom'
import {
    Box,
    createSelectableColumn,
    Icon,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

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

export const COLUMN_IDS = {
    TITLE: 'title',
    LAST_UPDATED_AT: 'lastUpdatedAt',
    IN_USE_BY_AI: 'inUseByAI',
    METRICS_TICKETS: 'metrics.tickets',
    METRICS_HANDOVER_TICKETS: 'metrics.handoverTickets',
    METRICS_CSAT: 'metrics.csat',
} as const

export const METRICS_COLUMN_PREFIX = 'metrics.' as const

const getCheckboxContent = (
    originalCell: unknown,
    info: unknown,
): React.ReactNode => {
    return typeof originalCell === 'function' ? originalCell(info) : null
}

const createSelectableColumnWithTooltip =
    (): ColumnDef<GroupedKnowledgeItem> => {
        const baseSelectableColumn =
            createSelectableColumn<GroupedKnowledgeItem>()
        const originalCell = baseSelectableColumn.cell

        return {
            ...baseSelectableColumn,
            cell: (info) => {
                const isGrouped = info.row.original.isGrouped
                const rowType = info.row.original.type
                const canSelect = info.row.getCanSelect()

                const isNonClickableType =
                    rowType === KnowledgeType.Document ||
                    rowType === KnowledgeType.URL ||
                    rowType === KnowledgeType.Domain

                const shouldShowTooltip =
                    isGrouped && isNonClickableType && !canSelect

                const checkboxContent = getCheckboxContent(originalCell, info)

                if (shouldShowTooltip) {
                    return (
                        <Tooltip
                            placement="top left"
                            trigger={<div>{checkboxContent}</div>}
                        >
                            <TooltipContent
                                caption="This is a folder of snippets created from an
                                    external source. Click the folder to manage
                                    the source and its contents."
                            />
                        </Tooltip>
                    )
                }

                return checkboxContent
            },
        }
    }

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
): ColumnDef<GroupedKnowledgeItem>[] => {
    // Base columns - always present
    const baseColumns: ColumnDef<GroupedKnowledgeItem>[] = [
        createSelectableColumnWithTooltip(),
        {
            id: COLUMN_IDS.TITLE,
            accessorKey: COLUMN_IDS.TITLE,
            header: () => (
                <SortableHeader
                    label="Title"
                    columnId={COLUMN_IDS.TITLE}
                    sortState={sortState}
                    onSort={onColumnSort}
                />
            ),
            cell: (info) => (
                <TitleCell
                    row={info.row}
                    searchTerm={searchTerm}
                    columnOnClick={columnOnClick}
                    availableActions={availableActions}
                    guidanceHelpCenterId={guidanceHelpCenterId}
                />
            ),
        },
    ]

    // Metric columns - only included when metricsDateRange is provided
    const metricColumns: ColumnDef<GroupedKnowledgeItem>[] = metricsDateRange
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
                  cell: (info) => {
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
                                    shopIntegrationId: shopIntegrationId ?? 0,
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
                                  !!drillDownMetricData && metrics.tickets > 0
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
                  },
                  sortUndefined: -1,
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
                  cell: (info) => {
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
                                    metricName: KnowledgeMetric.HandoverTickets,
                                    title: 'Handover tickets',
                                    resourceSourceId: Number(row.id),
                                    resourceSourceSetId:
                                        metrics.resourceSourceSetId,
                                    shopIntegrationId: shopIntegrationId ?? 0,
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
                  },
                  sortUndefined: -1,
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
                  cell: (info) => {
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
                                    shopIntegrationId: shopIntegrationId ?? 0,
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
                  },
                  sortUndefined: -1,
              },
          ]
        : []

    // End columns - always present
    const endColumns: ColumnDef<GroupedKnowledgeItem>[] = [
        {
            id: 'lastUpdatedAt',
            accessorKey: 'lastUpdatedAt',
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
                return <Text>{new Date(date).toLocaleDateString()}</Text>
            },
        },
        {
            id: 'inUseByAI',
            accessorKey: 'inUseByAI',
            header: () => (
                <SortableHeader
                    label="In use by AI Agent"
                    columnId="inUseByAI"
                    sortState={sortState}
                    onSort={onColumnSort}
                />
            ),
            cell: (info) => {
                const isGrouped = info.row.original.isGrouped
                const row = info.row.original

                if (isGrouped) {
                    return (
                        <Box alignItems="center" justifyContent="flex-start">
                            <Text>--</Text>
                        </Box>
                    )
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

                return (
                    <Box alignItems="center" justifyContent="flex-start">
                        {isInUse ? (
                            <Icon
                                name="check"
                                size="md"
                                color="content-success-primary"
                            />
                        ) : (
                            <Icon
                                name="close"
                                size="md"
                                color="content-neutral-tertiary"
                            />
                        )}
                    </Box>
                )
            },
        },
    ]

    return [...baseColumns, ...metricColumns, ...endColumns]
}

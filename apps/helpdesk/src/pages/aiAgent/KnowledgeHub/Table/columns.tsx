import { SegmentEvent } from '@repo/logging'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Color,
    createSelectableColumn,
    createSortableColumn,
    Icon,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
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
                        <Tooltip placement="top left">
                            <TooltipTrigger>
                                <div>{checkboxContent}</div>
                            </TooltipTrigger>
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
): ColumnDef<GroupedKnowledgeItem>[] => {
    // Base columns - always present
    const baseColumns: ColumnDef<GroupedKnowledgeItem>[] = [
        createSelectableColumnWithTooltip(),
        {
            ...createSortableColumn<GroupedKnowledgeItem>(
                'title',
                'Title',
                (info) => (
                    <TitleCell
                        row={info.row}
                        searchTerm={searchTerm}
                        columnOnClick={columnOnClick}
                        availableActions={availableActions}
                        guidanceHelpCenterId={guidanceHelpCenterId}
                    />
                ),
            ),
        },
    ]

    // Metric columns - only included when metricsDateRange is provided
    const metricColumns: ColumnDef<GroupedKnowledgeItem>[] = metricsDateRange
        ? [
              {
                  ...createSortableColumn<GroupedKnowledgeItem>(
                      'metrics.tickets',
                      'Tickets',
                      (info) => {
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
                                            shopIntegrationId ?? 0,
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
                      },
                  ),
                  sortUndefined: -1,
              },
              {
                  ...createSortableColumn<GroupedKnowledgeItem>(
                      'metrics.handoverTickets',
                      'Handover tickets',
                      (info) => {
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
                                            shopIntegrationId ?? 0,
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
                  ),
                  sortUndefined: -1,
              },
              {
                  ...createSortableColumn<GroupedKnowledgeItem>(
                      'metrics.csat',
                      'Avg CSAT',
                      (info) => {
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
                                            shopIntegrationId ?? 0,
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
                  ),
                  sortUndefined: -1,
              },
          ]
        : []

    // End columns - always present
    const endColumns: ColumnDef<GroupedKnowledgeItem>[] = [
        {
            ...createSortableColumn<GroupedKnowledgeItem>(
                'lastUpdatedAt',
                'Last updated',
                (info) => {
                    const date = info.getValue() as string
                    return <Text>{new Date(date).toLocaleDateString()}</Text>
                },
            ),
        },
        {
            ...createSortableColumn<GroupedKnowledgeItem>(
                'inUseByAI',
                'In use by AI Agent',
                (info) => {
                    const isGrouped = info.row.original.isGrouped
                    const row = info.row.original

                    if (isGrouped) {
                        return (
                            <Box
                                alignItems="center"
                                justifyContent="flex-start"
                            >
                                <Text>--</Text>
                            </Box>
                        )
                    }

                    // For FAQ (Help Center articles), check both conditions:
                    // 1. Article must have a published version (not only draft)
                    // 2. Article must have public visibility
                    let isInUse: boolean
                    if (row.type === KnowledgeType.FAQ) {
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
                                    color={Color.Green}
                                />
                            ) : (
                                <Icon
                                    name="close"
                                    size="md"
                                    color={Color.Grey}
                                />
                            )}
                        </Box>
                    )
                },
            ),
        },
    ]

    return [...baseColumns, ...metricColumns, ...endColumns]
}

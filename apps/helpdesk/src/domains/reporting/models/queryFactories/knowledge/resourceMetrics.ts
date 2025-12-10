import { useMemo } from 'react'

import type { Props as ImpactProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

import type { MetricName } from '../../../hooks/metricNames'
import { METRIC_NAMES } from '../../../hooks/metricNames'
import { useMetric } from '../../../hooks/useMetric'
import { useMetricPerDimensionV2 } from '../../../hooks/useMetricPerDimension'
import { LogicalOperatorEnum } from '../../../pages/common/components/Filter/constants'
import type { Cubes } from '../../cubes'
import {
    knowledgeCSATQueryV2Factory,
    knowledgeHandoverTicketsCountQueryV2Factory,
    knowledgeIntentsQueryV2Factory,
    knowledgeTicketsCountQueryV2Factory,
} from '../../scopes/knowledgeStatistics'
import { FilterKey, type StatsFilters } from '../../stat/types'
import type { ReportingQuery } from '../../types'

type ResourceMetricsParams = {
    resourceSourceId: number
    resourceSourceSetId: number
    timezone: string
    enabled?: boolean
}

type ResourceMetricsResult = {
    isLoading: boolean
    isError: boolean
    data?: {
        tickets?: ImpactProps['tickets']
        handoverTickets?: ImpactProps['handoverTickets']
        csat?: ImpactProps['csat']
        intents?: ImpactProps['intents']
    }
}

// V1 query factory for knowledge statistics
// Maps to TicketInsightsTaskV3 cube
export const createV1Query = <TCube extends Cubes = Cubes>(
    metricName: MetricName,
    resourceSourceId: number,
    resourceSourceSetId: number,
    filters: StatsFilters,
    timezone: string,
    measure: string,
): ReportingQuery<TCube> => {
    // Build base filters
    const baseFilters = [
        {
            member: 'TicketInsightsTaskV3.resourceSourceId',
            operator: 'equals',
            values: [String(resourceSourceId)],
        },
        {
            member: 'TicketInsightsTaskV3.resourceSourceSetId',
            operator: 'equals',
            values: [String(resourceSourceSetId)],
        },
        {
            member: 'TicketEnrichedV3.periodStart',
            operator: 'afterDate',
            values: [filters.period.start_datetime],
        },
        {
            member: 'TicketEnrichedV3.periodEnd',
            operator: 'beforeDate',
            values: [filters.period.end_datetime],
        },
        {
            member: 'TicketEnrichedV3.isTrashed',
            operator: 'equals',
            values: ['0'],
        },
        {
            member: 'TicketEnrichedV3.isSpam',
            operator: 'equals',
            values: ['0'],
        },
    ] as any[]

    // Add custom field filters if present
    if (
        filters[FilterKey.CustomFields] &&
        filters[FilterKey.CustomFields].length > 0
    ) {
        filters[FilterKey.CustomFields].forEach((customField) => {
            baseFilters.push({
                member: 'TicketCustomFieldsEnrichedV3.customFieldId',
                operator: 'equals',
                values: [String(customField.customFieldId)],
            })
            baseFilters.push({
                member: 'TicketCustomFieldsEnrichedV3.valueString',
                operator:
                    customField.operator === LogicalOperatorEnum.ONE_OF
                        ? 'equals'
                        : 'notEquals',
                values: customField.values,
            })
        })
    }

    // Override dimensions for intents query to use V3 cube names
    const dimensionsOverride =
        metricName === METRIC_NAMES.KNOWLEDGE_INTENTS
            ? [
                  'TicketCustomFieldsEnrichedV3.top2LevelsValue',
                  'TicketInsightsTaskV3.resourceType',
                  'TicketInsightsTaskV3.resourceSourceId',
                  'TicketInsightsTaskV3.resourceSourceSetId',
              ]
            : [
                  'TicketInsightsTaskV3.resourceType',
                  'TicketInsightsTaskV3.resourceSourceId',
                  'TicketInsightsTaskV3.resourceSourceSetId',
              ]

    return {
        measures: [measure] as any,
        dimensions: dimensionsOverride as any,
        filters: baseFilters,
        timeDimensions: [
            {
                dimension: 'TicketEnrichedV3.createdDatetime',
                dateRange: [
                    filters.period.start_datetime,
                    filters.period.end_datetime,
                ],
            },
        ] as any,
        metricName,
        timezone,
    }
}

/**
 * Parses intents data from metric results
 * - Sorts by ticket count descending
 * - Filters out empty/invalid values
 */
export const parseIntentsData = (
    allData: any[] | undefined,
    isError: boolean,
): string[] | undefined => {
    if (!allData || isError) {
        return undefined
    }

    // Sort records by ticket count descending
    const sortedRecords = [...allData].sort((a, b) => {
        const aCount = Number(a['TicketInsightsTaskV3.ticketCount']) || 0
        const bCount = Number(b['TicketInsightsTaskV3.ticketCount']) || 0
        return bCount - aCount
    })

    // Extract intent values, filtering out empty/invalid ones
    return sortedRecords
        .map((record) => record['TicketCustomFieldsEnriched.top2LevelsValue'])
        .filter(
            (value): value is string =>
                typeof value === 'string' && value !== '',
        )
}

/**
 * Hook to fetch resource metrics for the Impact section
 * Fetches metrics for the last 28 days:
 * - Number of tickets where this article was used
 * - Number of handover tickets
 * - Average CSAT score
 * - List of intents
 */
export const useResourceMetrics = ({
    resourceSourceId,
    resourceSourceSetId,
    timezone,
    enabled = true,
}: ResourceMetricsParams): ResourceMetricsResult => {
    // Fetch the AI Agent custom field IDs for filtering
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    // Calculate 28-day period and set up filters for specific article and help center
    const filters: StatsFilters = useMemo(() => {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 28)

        return {
            [FilterKey.Period]: {
                start_datetime: startDate.toISOString(),
                end_datetime: endDate.toISOString(),
            },
            resourceSourceId: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(resourceSourceId)],
            },
            resourceSourceSetId: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(resourceSourceSetId)],
            },
        }
    }, [resourceSourceId, resourceSourceSetId])

    // Create handover-specific filters that include custom field filter for "Handover" outcome
    // Handover values can be either "Handover::With message" or "Handover::Without message"
    const handoverFilters: StatsFilters = useMemo(() => {
        return {
            ...filters,
            [FilterKey.CustomFields]: [
                {
                    customFieldId: outcomeCustomFieldId,
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [
                        'Handover::With message',
                        'Handover::Without message',
                    ],
                },
            ],
        }
    }, [filters, outcomeCustomFieldId])

    // Create intent-specific filters to exclude spam and no-reply intents
    const intentFilters: StatsFilters = useMemo(() => {
        return {
            ...filters,
            [FilterKey.CustomFields]: [
                {
                    customFieldId: intentCustomFieldId,
                    operator: LogicalOperatorEnum.NOT_ONE_OF,
                    values: [
                        'Other::No Reply',
                        'Other::No Reply::Other',
                        'Other::Spam::Other',
                        'Other::Spam',
                    ],
                },
            ],
        }
    }, [filters, intentCustomFieldId])

    // Fetch tickets count
    const ticketsMetric = useMetric(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            filters,
            timezone,
            'TicketInsightsTaskV3.ticketCount',
        ),
        knowledgeTicketsCountQueryV2Factory({
            timezone,
            filters,
        }),
        enabled,
    )

    // Fetch handover tickets count
    const handoverTicketsV2Query = knowledgeHandoverTicketsCountQueryV2Factory({
        timezone,
        filters: handoverFilters,
    })

    const handoverTicketsMetric = useMetric(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
            resourceSourceId,
            resourceSourceSetId,
            handoverFilters,
            timezone,
            'TicketInsightsTaskV3.ticketCount',
        ),
        handoverTicketsV2Query,
        enabled,
    )

    // Fetch CSAT score
    const csatMetric = useMetric(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_CSAT,
            resourceSourceId,
            resourceSourceSetId,
            filters,
            timezone,
            'TicketInsightsTaskV3.avgSurveyScore',
        ),
        knowledgeCSATQueryV2Factory({
            timezone,
            filters,
        }),
        enabled,
    )

    // Fetch intents list
    const intentsMetric = useMetricPerDimensionV2(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_INTENTS,
            resourceSourceId,
            resourceSourceSetId,
            intentFilters,
            timezone,
            'TicketInsightsTaskV3.ticketCount',
        ),
        knowledgeIntentsQueryV2Factory({
            timezone,
            filters: intentFilters,
        }),
        undefined,
        enabled,
    )

    const isLoading =
        ticketsMetric.isFetching ||
        handoverTicketsMetric.isFetching ||
        csatMetric.isFetching ||
        intentsMetric.isFetching

    const isError =
        ticketsMetric.isError ||
        handoverTicketsMetric.isError ||
        csatMetric.isError ||
        intentsMetric.isError

    // Parse intents data from the metric response
    const intents: string[] | undefined = useMemo(() => {
        return parseIntentsData(
            intentsMetric.data?.allData,
            intentsMetric.isError,
        )
    }, [intentsMetric.data, intentsMetric.isError])

    return {
        isLoading,
        isError,
        data:
            !isLoading && !isError
                ? {
                      tickets: ticketsMetric.data?.value
                          ? {
                                value: ticketsMetric.data.value,
                                // TODO: drilldown
                                onClick: undefined,
                            }
                          : null,
                      handoverTickets: handoverTicketsMetric.data?.value
                          ? {
                                value: handoverTicketsMetric.data.value,
                                // TODO: drilldown
                                onClick: undefined,
                            }
                          : null,
                      csat: csatMetric.data?.value
                          ? {
                                value: Number(csatMetric.data.value.toFixed(2)),
                                // TODO: drilldown
                                onClick: undefined,
                            }
                          : null,
                      intents: intents ?? null,
                  }
                : undefined,
    }
}

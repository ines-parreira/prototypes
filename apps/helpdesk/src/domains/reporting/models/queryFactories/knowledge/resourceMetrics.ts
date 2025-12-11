import { useMemo } from 'react'

import _groupBy from 'lodash/groupBy'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import { TicketCustomFieldsDimension } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    TicketInsightsTaskDimension,
    TicketInsightsTaskMeasure,
} from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import {
    knowledgeCSATQueryV2Factory,
    knowledgeHandoverTicketsCountQueryV2Factory,
    knowledgeIntentsQueryV2Factory,
    knowledgeTicketsCountQueryV2Factory,
} from 'domains/reporting/models/scopes/knowledgeInsights'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import type {
    ReportingFilter,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type { Props as ImpactProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

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

type AllResourcesMetricsParams = {
    shopIntegrationId: number
    timezone: string
    enabled?: boolean
    loadIntents?: boolean
}

type ResourceMetrics = {
    resourceSourceId: number
    resourceSourceSetId: number
    tickets: number | null
    handoverTickets: number | null
    csat: number | null
    intents: string[] | null
}

type AllResourcesMetricsResult = {
    isLoading: boolean
    isError: boolean
    data?: ResourceMetrics[]
}

type MetricDataRecord = Record<string, string | number | null | undefined>

// V1 query factory for knowledge statistics
export const createV1Query = <TCube extends Cubes = Cubes>(
    metricName: MetricName,
    resourceSourceId: number | null,
    resourceSourceSetId: number | null,
    filters: ApiStatsFilters,
    timezone: string,
    measure: string,
): ReportingQuery<TCube> => {
    // Build base filters
    const baseFilters: ReportingFilter[] = []

    // Add resource filters
    if (resourceSourceId !== null) {
        baseFilters.push({
            member: TicketInsightsTaskDimension.ResourceSourceId,
            operator: ReportingFilterOperator.Equals,
            values: [String(resourceSourceId)],
        })
    } else {
        baseFilters.push({
            member: TicketInsightsTaskDimension.ResourceSourceId,
            operator: ReportingFilterOperator.Set,
            values: [],
        })
    }

    if (resourceSourceSetId !== null) {
        baseFilters.push({
            member: TicketInsightsTaskDimension.ResourceSourceSetId,
            operator: ReportingFilterOperator.Equals,
            values: [String(resourceSourceSetId)],
        })
    } else {
        baseFilters.push({
            member: TicketInsightsTaskDimension.ResourceSourceSetId,
            operator: ReportingFilterOperator.Set,
            values: [],
        })
    }

    // Add standard filters
    baseFilters.push(
        {
            member: 'TicketEnriched.periodStart',
            operator: ReportingFilterOperator.AfterDate,
            values: [filters.period.start_datetime],
        },
        {
            member: 'TicketEnriched.periodEnd',
            operator: ReportingFilterOperator.BeforeDate,
            values: [filters.period.end_datetime],
        },
        {
            member: 'TicketEnriched.isTrashed',
            operator: ReportingFilterOperator.Equals,
            values: ['0'],
        },
        {
            member: 'TicketEnriched.isSpam',
            operator: ReportingFilterOperator.Equals,
            values: ['0'],
        },
        {
            member: TicketInsightsTaskDimension.ResourceType,
            operator: ReportingFilterOperator.Equals,
            values: [
                'GUIDANCE',
                'ARTICLE',
                'MACRO',
                'EXTERNAL_SNIPPET',
                'FILE_EXTERNAL_SNIPPET',
                'STORE_WEBSITE_QUESTION_SNIPPET',
            ],
        },
    )

    // Add shop integration ID filter if present
    if (
        filters[APIOnlyFilterKey.ShopIntegrationId] &&
        filters[APIOnlyFilterKey.ShopIntegrationId].values.length > 0
    ) {
        baseFilters.push({
            member: TicketInsightsTaskDimension.ShopIntegrationId,
            operator: ReportingFilterOperator.Equals,
            values: filters[APIOnlyFilterKey.ShopIntegrationId].values,
        })
    }

    // Add custom field filters if present
    if (
        filters[FilterKey.CustomFields] &&
        filters[FilterKey.CustomFields].length > 0
    ) {
        filters[FilterKey.CustomFields].forEach((customField) => {
            baseFilters.push({
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: ReportingFilterOperator.Equals,
                values: [String(customField.customFieldId)],
            })
            baseFilters.push({
                member: 'TicketCustomFieldsEnriched.valueString',
                operator:
                    customField.operator === LogicalOperatorEnum.ONE_OF
                        ? ReportingFilterOperator.Equals
                        : ReportingFilterOperator.NotEquals,
                values: customField.values,
            })
        })
    }

    // Override dimensions for intents query to include top2LevelsValue for grouping by intent
    const dimensionsOverride =
        metricName === METRIC_NAMES.KNOWLEDGE_INTENTS
            ? [
                  TicketCustomFieldsDimension.TicketCustomFieldsTop2LevelsValue,
                  TicketInsightsTaskDimension.ResourceType,
                  TicketInsightsTaskDimension.ResourceSourceId,
                  TicketInsightsTaskDimension.ResourceSourceSetId,
              ]
            : [
                  TicketInsightsTaskDimension.ResourceType,
                  TicketInsightsTaskDimension.ResourceSourceId,
                  TicketInsightsTaskDimension.ResourceSourceSetId,
              ]

    return {
        measures: [measure] as TCube['measures'][],
        dimensions: dimensionsOverride as TCube['dimensions'][],
        filters: baseFilters,
        timeDimensions: [
            {
                dimension: 'TicketEnriched.createdDatetime',
                dateRange: [
                    filters.period.start_datetime,
                    filters.period.end_datetime,
                ],
            },
        ] as ReportingQuery<TCube>['timeDimensions'],
        metricName,
        timezone,
    }
}

/**
 * Creates a composite key for uniquely identifying a resource
 */
const createResourceKey = (
    resourceSourceId: string | number,
    resourceSourceSetId: string | number,
): string => `${resourceSourceId}-${resourceSourceSetId}`

/**
 * Parses intents data from metric results
 * - Sorts by ticket count descending
 * - Filters out empty/invalid values
 */
export const parseIntentsData = (
    allData: MetricDataRecord[] | undefined,
    isError: boolean,
): string[] | undefined => {
    if (!allData || isError) {
        return undefined
    }

    // Sort records by ticket count descending
    const sortedRecords = [...allData].sort((a, b) => {
        const aCount = Number(a[TicketInsightsTaskMeasure.TicketCount]) || 0
        const bCount = Number(b[TicketInsightsTaskMeasure.TicketCount]) || 0
        return bCount - aCount
    })

    // Extract intent values, filtering out empty/invalid ones
    return sortedRecords
        .map(
            (record) =>
                record[
                    TicketCustomFieldsDimension
                        .TicketCustomFieldsTop2LevelsValue
                ],
        )
        .filter(
            (value): value is string =>
                typeof value === 'string' && value !== '',
        )
}

/**
 * Parses and transforms intents data grouped by resource source ID and set ID
 * - Groups records by resourceSourceId and resourceSourceSetId
 * - For each resource, sorts by ticket count descending
 * - Filters out empty/invalid values
 */
export const parseIntentsDataByResource = (
    allData: MetricDataRecord[] | undefined,
    isError: boolean,
): Record<string, string[]> => {
    if (!allData || isError) {
        return {}
    }

    // Group by resourceSourceId and resourceSourceSetId combination
    const grouped = _groupBy(allData, (record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        return createResourceKey(
            resourceSourceId ?? 0,
            resourceSourceSetId ?? 0,
        )
    })

    // For each resource, sort and transform intents
    return Object.entries(grouped).reduce(
        (acc, [key, records]) => {
            const sortedRecords = [...records].sort((a, b) => {
                const aCount =
                    Number(a[TicketInsightsTaskMeasure.TicketCount]) || 0
                const bCount =
                    Number(b[TicketInsightsTaskMeasure.TicketCount]) || 0
                return bCount - aCount
            })

            acc[key] = sortedRecords
                .map(
                    (record) =>
                        record[
                            TicketCustomFieldsDimension
                                .TicketCustomFieldsTop2LevelsValue
                        ],
                )
                .filter(
                    (value): value is string =>
                        typeof value === 'string' && value !== '',
                )

            return acc
        },
        {} as Record<string, string[]>,
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
    const filters: ApiStatsFilters = useMemo(() => {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 28)

        return {
            [FilterKey.Period]: {
                start_datetime: startDate.toISOString(),
                end_datetime: endDate.toISOString(),
            },
            [APIOnlyFilterKey.ResourceSourceId]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(resourceSourceId)],
            },
            [APIOnlyFilterKey.ResourceSourceSetId]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(resourceSourceSetId)],
            },
        }
    }, [resourceSourceId, resourceSourceSetId])

    // Create handover-specific filters that include custom field filter for "Handover" outcome
    // Handover values can be either "Handover::With message" or "Handover::Without message"
    const handoverFilters: ApiStatsFilters = useMemo(() => {
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
    const intentFilters: ApiStatsFilters = useMemo(() => {
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
            TicketInsightsTaskMeasure.TicketCount,
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
            TicketInsightsTaskMeasure.TicketCount,
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
            TicketInsightsTaskMeasure.AvgSurveyScore,
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
            TicketInsightsTaskMeasure.TicketCount,
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

/**
 * Helper function to aggregate resource metrics from multiple queries
 */
export const aggregateResourceMetrics = (
    ticketsData: MetricDataRecord[] | undefined,
    handoverData: MetricDataRecord[] | undefined,
    csatData: MetricDataRecord[] | undefined,
    intentsData: MetricDataRecord[] | undefined,
): ResourceMetrics[] => {
    const resourceMap = new Map<string, ResourceMetrics>()

    const getResource = (
        resourceSourceId: string,
        resourceSourceSetId: string,
    ) => {
        const key = createResourceKey(resourceSourceId, resourceSourceSetId)
        if (!resourceMap.has(key)) {
            resourceMap.set(key, {
                resourceSourceId: Number(resourceSourceId),
                resourceSourceSetId: Number(resourceSourceSetId),
                tickets: null,
                handoverTickets: null,
                csat: null,
                intents: null,
            })
        }
        return resourceMap.get(key)!
    }

    ticketsData?.forEach((record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        if (resourceSourceId == null || resourceSourceSetId == null) return

        const resource = getResource(
            String(resourceSourceId),
            String(resourceSourceSetId),
        )
        resource.tickets =
            Number(record[TicketInsightsTaskMeasure.TicketCount]) || 0
    })

    handoverData?.forEach((record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        if (resourceSourceId == null || resourceSourceSetId == null) return

        const resource = getResource(
            String(resourceSourceId),
            String(resourceSourceSetId),
        )
        resource.handoverTickets =
            Number(record[TicketInsightsTaskMeasure.TicketCount]) || 0
    })

    csatData?.forEach((record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        if (resourceSourceId == null || resourceSourceSetId == null) return

        const resource = getResource(
            String(resourceSourceId),
            String(resourceSourceSetId),
        )
        const avgScore = Number(
            record[TicketInsightsTaskMeasure.AvgSurveyScore],
        )
        resource.csat = avgScore ? Number(avgScore.toFixed(2)) : null
    })

    const intentsByResource = parseIntentsDataByResource(intentsData, false)
    Object.entries(intentsByResource).forEach(([key, intents]) => {
        if (resourceMap.has(key)) {
            resourceMap.get(key)!.intents = intents
        }
    })

    return Array.from(resourceMap.values())
}

/**
 * Hook to fetch resource metrics for all resources
 * Fetches metrics for the last 28 days filtered by shopIntegrationId:
 * - Number of tickets where this article was used
 * - Number of handover tickets
 * - Average CSAT score
 * - List of intents (optional, controlled by loadIntents parameter)
 */
export const useAllResourcesMetrics = ({
    shopIntegrationId,
    timezone,
    enabled = true,
    loadIntents = true,
}: AllResourcesMetricsParams): AllResourcesMetricsResult => {
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const filters: ApiStatsFilters = useMemo(() => {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 28)

        return {
            [FilterKey.Period]: {
                start_datetime: startDate.toISOString(),
                end_datetime: endDate.toISOString(),
            },
            [APIOnlyFilterKey.ShopIntegrationId]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(shopIntegrationId)],
            },
        }
    }, [shopIntegrationId])

    const handoverFilters: ApiStatsFilters = useMemo(() => {
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

    const intentFilters: ApiStatsFilters = useMemo(() => {
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

    const ticketsMetric = useMetricPerDimensionV2(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS,
            null,
            null,
            filters,
            timezone,
            TicketInsightsTaskMeasure.TicketCount,
        ),
        knowledgeTicketsCountQueryV2Factory({
            timezone,
            filters,
        }),
        undefined,
        enabled,
    )

    const handoverTicketsMetric = useMetricPerDimensionV2(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS,
            null,
            null,
            handoverFilters,
            timezone,
            TicketInsightsTaskMeasure.TicketCount,
        ),
        knowledgeHandoverTicketsCountQueryV2Factory({
            timezone,
            filters: handoverFilters,
        }),
        undefined,
        enabled,
    )

    const csatMetric = useMetricPerDimensionV2(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_CSAT,
            null,
            null,
            filters,
            timezone,
            TicketInsightsTaskMeasure.AvgSurveyScore,
        ),
        knowledgeCSATQueryV2Factory({
            timezone,
            filters,
        }),
        undefined,
        enabled,
    )

    const intentsMetric = useMetricPerDimensionV2(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_INTENTS,
            null,
            null,
            intentFilters,
            timezone,
            TicketInsightsTaskMeasure.TicketCount,
        ),
        knowledgeIntentsQueryV2Factory({
            timezone,
            filters: intentFilters,
        }),
        undefined,
        enabled && loadIntents,
    )

    const isLoading =
        ticketsMetric.isFetching ||
        handoverTicketsMetric.isFetching ||
        csatMetric.isFetching ||
        (loadIntents && intentsMetric.isFetching)

    const isError =
        ticketsMetric.isError ||
        handoverTicketsMetric.isError ||
        csatMetric.isError ||
        (loadIntents && intentsMetric.isError)

    const data = useMemo(() => {
        if (isLoading || isError) return undefined

        return aggregateResourceMetrics(
            ticketsMetric.data?.allData,
            handoverTicketsMetric.data?.allData,
            csatMetric.data?.allData,
            loadIntents ? intentsMetric.data?.allData : undefined,
        )
    }, [
        isLoading,
        isError,
        loadIntents,
        ticketsMetric.data,
        handoverTicketsMetric.data,
        csatMetric.data,
        intentsMetric.data,
    ])

    return {
        isLoading,
        isError,
        data,
    }
}

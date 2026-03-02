import { useCallback, useMemo } from 'react'

import _groupBy from 'lodash/groupBy'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsDimension } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { TicketInsightsTaskCubeWithJoins } from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import {
    TicketInsightsTaskDimension,
    TicketInsightsTaskDimensionV2,
    TicketInsightsTaskMeasure,
    TicketInsightsTaskMeasureV2,
} from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    knowledgeCSATQueryV2Factory,
    knowledgeHandoverTicketsCountQueryV2Factory,
    knowledgeIntentsQueryV2Factory,
    knowledgeTicketsCountQueryV2Factory,
    knowledgeTicketsResourceCountQueryV2Factory,
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
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    KnowledgeStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import useAppDispatch from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import type { Props as ImpactProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

/*
Knowledge Hub loads statistics of all resources of a shop (guidances, HC articles, urls, etc.).
They are not paginated because the user must be able to sort articles by a stat column and the source
of truth is Help Center, not Clickhouse.
*/
export const KNOWLEDGE_QUERY_LIMIT = 10000

export type KnowledgeIntentMetric = {
    intent: string
    ticketCount: number
}

type ResourceMetricsParams = {
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    timezone: string
    enabled?: boolean
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
}

type ResourceMetricsResult = {
    isLoading: boolean
    isError: boolean
    data?: {
        tickets?: ImpactProps['tickets']
        handoverTickets?: ImpactProps['handoverTickets']
        csat?: ImpactProps['csat']
        intents?: KnowledgeIntentMetric[] | null
    }
}

type AllResourcesMetricsParams = {
    shopIntegrationId: number
    timezone: string
    enabled?: boolean
    loadIntents?: boolean
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
}

type ResourceMetrics = {
    resourceSourceId: number
    resourceSourceSetId: number
    tickets: number | null
    handoverTickets: number | null
    csat: number | null
    intents: KnowledgeIntentMetric[] | null
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
    if (
        !filters.period ||
        !filters.period.start_datetime ||
        !filters.period.end_datetime
    ) {
        throw new Error(
            'Period filters (start_datetime and end_datetime) are required for knowledge metrics queries',
        )
    }

    baseFilters.push({
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
    })

    const customFields: {
        customFieldId: number
        operator: any
        values: string[]
    }[] = []
    // Add custom field filters if present
    if (
        filters[FilterKey.CustomFields] &&
        filters[FilterKey.CustomFields].length > 0
    ) {
        filters[FilterKey.CustomFields].forEach((cf) => {
            baseFilters.push({
                member: 'TicketCustomFieldsEnriched.customFieldId',
                operator: ReportingFilterOperator.Equals,
                values: [cf.customFieldId.toString()],
            })
            customFields.push({
                customFieldId: cf.customFieldId,
                operator: cf.operator,
                values: cf.values.map((value) =>
                    cf.customFieldId.toString().concat('::' + String(value)),
                ),
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
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(KnowledgeStatsFiltersMembers, {
                ...filters,
                ...(customFields.length > 0
                    ? { [FilterKey.CustomFields]: customFields }
                    : {}),
            }),
            ...baseFilters,
        ],
        timeDimensions: [],
        metricName,
        timezone,
    }
}

/**
 * Creates a V1 drilldown query for knowledge statistics
 * Adds TicketId dimension and sets limit to 100
 */
export const createV1DrillDownQuery = (
    metricName: MetricName,
    resourceSourceId: number,
    resourceSourceSetId: number,
    filters: ApiStatsFilters,
    timezone: string,
): ReportingQuery<TicketInsightsTaskCubeWithJoins> => {
    const baseQuery = createV1Query<TicketInsightsTaskCubeWithJoins>(
        metricName,
        resourceSourceId,
        resourceSourceSetId,
        filters,
        timezone,
        '', // measure not needed for drilldown
    )

    return {
        ...baseQuery,
        metricName,
        measures: [] as any,
        dimensions: [
            TicketDimension.TicketId,
            TicketDimension.CreatedDatetime,
            ...baseQuery.dimensions,
        ] as any,
        limit: DRILLDOWN_QUERY_LIMIT,
        order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
    }
}

/**
 * Public drilldown query factory for knowledge tickets
 * Used by central routing in helpers.ts
 */
export const knowledgeTicketsDrillDownQueryFactory = (
    filters: ApiStatsFilters,
    timezone: string,
    resourceSourceId: number,
    resourceSourceSetId: number,
): ReportingQuery<TicketInsightsTaskCubeWithJoins> => {
    return createV1DrillDownQuery(
        METRIC_NAMES.KNOWLEDGE_TICKETS_DRILL_DOWN,
        resourceSourceId,
        resourceSourceSetId,
        filters,
        timezone,
    )
}

/**
 * Public drilldown query factory for knowledge handover tickets
 * Used by central routing in helpers.ts
 */
export const knowledgeHandoverTicketsDrillDownQueryFactory = (
    filters: ApiStatsFilters,
    timezone: string,
    resourceSourceId: number,
    resourceSourceSetId: number,
): ReportingQuery<TicketInsightsTaskCubeWithJoins> => {
    return createV1DrillDownQuery(
        METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS_DRILL_DOWN,
        resourceSourceId,
        resourceSourceSetId,
        filters,
        timezone,
    )
}

/**
 * Public drilldown query factory for knowledge CSAT
 * Used by central routing in helpers.ts
 */
export const knowledgeCSATDrillDownQueryFactory = (
    filters: ApiStatsFilters,
    timezone: string,
    resourceSourceId: number,
    resourceSourceSetId: number,
): ReportingQuery<TicketInsightsTaskCubeWithJoins> => {
    const baseQuery = createV1DrillDownQuery(
        METRIC_NAMES.KNOWLEDGE_CSAT_DRILL_DOWN,
        resourceSourceId,
        resourceSourceSetId,
        filters,
        timezone,
    )

    // Override measures to include avgSurveyScore for CSAT drilldown
    // Add filter to only include tickets with survey scores
    return {
        ...baseQuery,
        measures: ['TicketInsightsTask.avgSurveyScore'] as any,
        filters: [
            ...baseQuery.filters,
            {
                member: 'TicketInsightsTask.avgSurveyScore' as any,
                operator: ReportingFilterOperator.Set,
                values: [],
            },
        ],
    }
}

/**
 * Query factory to fetch the first 3 recent ticket IDs for knowledge resources
 * Returns the 3 most recent tickets ordered by creation date descending
 */
export const knowledgeRecentTicketsQueryFactory = (
    filters: ApiStatsFilters,
    timezone: string,
    resourceSourceId: number,
    resourceSourceSetId: number,
): ReportingQuery<TicketInsightsTaskCubeWithJoins> => {
    const baseQuery = createV1DrillDownQuery(
        METRIC_NAMES.KNOWLEDGE_TICKETS_DRILL_DOWN,
        resourceSourceId,
        resourceSourceSetId,
        filters,
        timezone,
    )

    return {
        ...baseQuery,
        limit: 3,
        order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
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
): KnowledgeIntentMetric[] | undefined => {
    if (!allData || isError) {
        return undefined
    }

    // Sort records by ticket count descending
    // Support both V1 (cube-prefixed) and V2 (unprefixed) field names
    const sortedRecords = [...allData].sort((a, b) => {
        const aCount =
            Number(
                a[TicketInsightsTaskMeasureV2.TicketCount] ??
                    a[TicketInsightsTaskMeasure.TicketCount],
            ) || 0
        const bCount =
            Number(
                b[TicketInsightsTaskMeasureV2.TicketCount] ??
                    b[TicketInsightsTaskMeasure.TicketCount],
            ) || 0
        return bCount - aCount
    })

    // Extract intent values, filtering out empty/invalid ones
    // Support both V1 (cube-prefixed) and V2 (unprefixed) field names
    return sortedRecords
        .map((record) => {
            // Try V2 API field name first, fall back to V1
            const intent =
                record[
                    TicketInsightsTaskDimensionV2.CustomFieldTop2LevelsValue
                ] ??
                record[
                    TicketCustomFieldsDimension
                        .TicketCustomFieldsTop2LevelsValue
                ]
            const ticketCount =
                Number(
                    record[TicketInsightsTaskMeasureV2.TicketCount] ??
                        record[TicketInsightsTaskMeasure.TicketCount],
                ) || 0

            return {
                intent,
                ticketCount,
            }
        })
        .filter(
            (
                value,
            ): value is {
                intent: string
                ticketCount: number
            } => typeof value.intent === 'string' && value.intent !== '',
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
): Record<string, KnowledgeIntentMetric[]> => {
    if (!allData || isError) {
        return {}
    }

    // Group by resourceSourceId and resourceSourceSetId combination
    // Support both V1 (cube-prefixed) and V2 (unprefixed) field names
    const grouped = _groupBy(allData, (record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceId] ??
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceSetId] ??
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
                // Support both V1 and V2 field names
                const aCount =
                    Number(
                        a[TicketInsightsTaskMeasureV2.TicketCount] ??
                            a[TicketInsightsTaskMeasure.TicketCount],
                    ) || 0
                const bCount =
                    Number(
                        b[TicketInsightsTaskMeasureV2.TicketCount] ??
                            b[TicketInsightsTaskMeasure.TicketCount],
                    ) || 0
                return bCount - aCount
            })

            // Support both V1 (cube-prefixed) and V2 (unprefixed) field names
            acc[key] = sortedRecords
                .map((record) => {
                    // Try V2 API field name first, fall back to V1
                    const intent =
                        record[
                            TicketInsightsTaskDimensionV2
                                .CustomFieldTop2LevelsValue
                        ] ??
                        record[
                            TicketCustomFieldsDimension
                                .TicketCustomFieldsTop2LevelsValue
                        ]
                    const ticketCount =
                        Number(
                            record[TicketInsightsTaskMeasureV2.TicketCount] ??
                                record[TicketInsightsTaskMeasure.TicketCount],
                        ) || 0

                    return {
                        intent,
                        ticketCount,
                    }
                })
                .filter(
                    (
                        value,
                    ): value is {
                        intent: string
                        ticketCount: number
                    } =>
                        typeof value.intent === 'string' && value.intent !== '',
                )

            return acc
        },
        {} as Record<string, KnowledgeIntentMetric[]>,
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
    shopIntegrationId,
    timezone,
    enabled = true,
    dateRange,
}: ResourceMetricsParams): ResourceMetricsResult => {
    // Fetch the AI Agent custom field IDs for filtering
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    // Set up filters for specific article and help center
    const filters: ApiStatsFilters = useMemo(() => {
        return {
            [FilterKey.Period]: {
                start_datetime: dateRange.start_datetime,
                end_datetime: dateRange.end_datetime,
            },
            [APIOnlyFilterKey.ResourceSourceId]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(resourceSourceId)],
            },
            [APIOnlyFilterKey.ResourceSourceSetId]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [String(resourceSourceSetId)],
            },
            [FilterKey.Stores]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [shopIntegrationId],
            },
        }
    }, [resourceSourceId, resourceSourceSetId, shopIntegrationId, dateRange])

    // Create handover-specific filters that include custom field filter for "Handover" outcome
    // Handover values can be either "Handover::With message" or "Handover::Without message"
    const handoverFilters: ApiStatsFilters = useMemo(() => {
        return {
            ...filters,
            [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator([
                outcomeCustomFieldId,
            ]),
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
            [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator([
                intentCustomFieldId,
            ]),
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

    // Create onClick handlers for drilldown
    const dispatch = useAppDispatch()

    const createOnClick = useCallback(
        (
            metricName: KnowledgeMetric,
            title: string,
            outcomeId?: number,
            intentId?: number,
        ) =>
            () => {
                const metricData = {
                    metricName,
                    title,
                    resourceSourceId,
                    resourceSourceSetId,
                    shopIntegrationId,
                    dateRange,
                    ...(outcomeId && { outcomeCustomFieldId: outcomeId }),
                    ...(intentId && { intentCustomFieldId: intentId }),
                }
                dispatch(setMetricData(metricData))
            },
        [
            dispatch,
            resourceSourceId,
            resourceSourceSetId,
            shopIntegrationId,
            dateRange,
        ],
    )

    // Fetch tickets count
    const ticketsMetric = useMetric(
        createV1Query(
            METRIC_NAMES.KNOWLEDGE_TICKETS_RESOURCE_TICKET_COUNT,
            resourceSourceId,
            resourceSourceSetId,
            filters,
            timezone,
            TicketInsightsTaskMeasure.TicketCount,
        ),
        knowledgeTicketsResourceCountQueryV2Factory({
            timezone,
            filters,
            limit: KNOWLEDGE_QUERY_LIMIT,
        }),
        enabled,
    )

    // Fetch handover tickets count
    const handoverTicketsV2Query = knowledgeHandoverTicketsCountQueryV2Factory({
        timezone,
        filters: handoverFilters,
        limit: KNOWLEDGE_QUERY_LIMIT,
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
            limit: KNOWLEDGE_QUERY_LIMIT,
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
            limit: KNOWLEDGE_QUERY_LIMIT,
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
    const intents: KnowledgeIntentMetric[] | undefined = useMemo(() => {
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
                                onClick: createOnClick(
                                    KnowledgeMetric.Tickets,
                                    'Tickets',
                                ),
                            }
                          : null,
                      handoverTickets: handoverTicketsMetric.data?.value
                          ? {
                                value: handoverTicketsMetric.data.value,
                                onClick: createOnClick(
                                    KnowledgeMetric.HandoverTickets,
                                    'Handover Tickets',
                                    outcomeCustomFieldId,
                                    intentCustomFieldId,
                                ),
                            }
                          : null,
                      csat: csatMetric.data?.value
                          ? {
                                value: Number(csatMetric.data.value.toFixed(1)),
                                onClick: createOnClick(
                                    KnowledgeMetric.CSAT,
                                    'CSAT',
                                ),
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

    // Support both V1 (cube-prefixed) and V2 (unprefixed) field names
    ticketsData?.forEach((record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceId] ??
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceSetId] ??
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        if (resourceSourceId == null || resourceSourceSetId == null) return

        const resource = getResource(
            String(resourceSourceId),
            String(resourceSourceSetId),
        )
        resource.tickets =
            Number(
                record[TicketInsightsTaskMeasureV2.TicketCount] ??
                    record[TicketInsightsTaskMeasure.TicketCount],
            ) || 0
    })

    handoverData?.forEach((record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceId] ??
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceSetId] ??
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        if (resourceSourceId == null || resourceSourceSetId == null) return

        const resource = getResource(
            String(resourceSourceId),
            String(resourceSourceSetId),
        )
        resource.handoverTickets =
            Number(
                record[TicketInsightsTaskMeasureV2.TicketCount] ??
                    record[TicketInsightsTaskMeasure.TicketCount],
            ) || 0
    })

    csatData?.forEach((record) => {
        const resourceSourceId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceId] ??
            record[TicketInsightsTaskDimension.ResourceSourceId]
        const resourceSourceSetId =
            record[TicketInsightsTaskDimensionV2.ResourceSourceSetId] ??
            record[TicketInsightsTaskDimension.ResourceSourceSetId]
        if (resourceSourceId == null || resourceSourceSetId == null) return

        const resource = getResource(
            String(resourceSourceId),
            String(resourceSourceSetId),
        )
        const avgScore = Number(
            record[TicketInsightsTaskMeasureV2.AverageSurveyScore] ??
                record[TicketInsightsTaskMeasure.AvgSurveyScore],
        )
        resource.csat = avgScore ? Number(avgScore.toFixed(1)) : null
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
    dateRange,
}: AllResourcesMetricsParams): AllResourcesMetricsResult => {
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const filters: ApiStatsFilters = useMemo(() => {
        return {
            [FilterKey.Period]: {
                start_datetime: dateRange.start_datetime,
                end_datetime: dateRange.end_datetime,
            },
            [FilterKey.Stores]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [shopIntegrationId],
            },
        }
    }, [shopIntegrationId, dateRange])

    const handoverFilters: ApiStatsFilters = useMemo(() => {
        return {
            ...filters,
            [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator([
                outcomeCustomFieldId,
            ]),
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
            [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator(
                [intentCustomFieldId],
                LogicalOperatorEnum.NOT_ONE_OF,
            ),
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
            METRIC_NAMES.KNOWLEDGE_TICKETS_TICKET_COUNT,
            null,
            null,
            filters,
            timezone,
            TicketInsightsTaskMeasure.TicketCount,
        ),
        knowledgeTicketsCountQueryV2Factory({
            timezone,
            filters,
            limit: KNOWLEDGE_QUERY_LIMIT,
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
            limit: KNOWLEDGE_QUERY_LIMIT,
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
            limit: KNOWLEDGE_QUERY_LIMIT,
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
            limit: KNOWLEDGE_QUERY_LIMIT,
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
        if (isLoading || isError) {
            return undefined
        }

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

/**
 * Type definitions for recent tickets
 */
type RecentTicket = {
    id: number
    title: string
    lastUpdatedDatetime: Date
    messageCount: number
    aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS
}

type UseRecentTicketsParams = {
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    timezone: string
    enabled: boolean
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
}

type UseRecentTicketsResult = {
    data: RecentTicket[] | null
    isLoading: boolean
    isError: boolean
}

export const getLast28DaysDateRange = () => {
    const endDate = new Date()
    endDate.setHours(endDate.getHours() + 1, 0, 0, 0)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 28)
    startDate.setHours(startDate.getHours() + 1, 0, 0, 0)

    return {
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
    }
}

/**
 * Hook to fetch and transform the latest 3 recent tickets for a knowledge resource
 * Uses enrichment to get full ticket details (title, datetime, custom fields, etc.)
 */
export function useRecentTickets({
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    timezone,
    enabled,
    dateRange,
}: UseRecentTicketsParams): UseRecentTicketsResult {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    // Create filters with provided date range and shop integration ID
    const filters: ApiStatsFilters = useMemo(() => {
        return {
            [FilterKey.Period]: {
                start_datetime: dateRange.start_datetime,
                end_datetime: dateRange.end_datetime,
            },
            [FilterKey.Stores]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [shopIntegrationId],
            },
        }
    }, [dateRange, shopIntegrationId])

    // Create the query
    const query = useMemo(
        () =>
            knowledgeRecentTicketsQueryFactory(
                filters,
                timezone,
                resourceSourceId,
                resourceSourceSetId,
            ),
        [filters, timezone, resourceSourceId, resourceSourceSetId],
    )

    // Step 1: Fetch ticket IDs
    const {
        data: metricsData,
        isFetching: isMetricsFetching,
        isError: isMetricsError,
    } = useMetricPerDimensionV2(query, undefined, undefined, enabled)

    const ticketIds = useMemo(() => {
        if (!enabled || !metricsData?.allData) return []

        return metricsData.allData
            .map((record) => {
                const id = record[TicketDimension.TicketId]
                return parseInt(id, 10)
            })
            .filter((id): id is number => !isNaN(id))
            .slice(0, 3)
    }, [enabled, metricsData])

    // Step 2: Fetch full ticket details
    const ticket1 = useGetTicket(ticketIds[0], undefined, {
        query: {
            enabled: enabled && ticketIds.length > 0,
        },
    })
    const ticket2 = useGetTicket(ticketIds[1], undefined, {
        query: {
            enabled: enabled && ticketIds.length > 1,
        },
    })
    const ticket3 = useGetTicket(ticketIds[2], undefined, {
        query: {
            enabled: enabled && ticketIds.length > 2,
        },
    })

    // Transform ticket data
    const transformedData = useMemo(() => {
        if (!enabled || ticketIds.length === 0) return null

        const ticketResponses = [
            ticket1.data,
            ticket2.data,
            ticket3.data,
        ].filter(
            (response): response is NonNullable<typeof response> => !!response,
        )

        const tickets = ticketResponses
            .map((response) => (response as any).data)
            .filter((ticket): ticket is NonNullable<typeof ticket> => !!ticket)
            .map((ticket) => {
                // Get AI Agent outcome from custom fields
                const outcomeField =
                    ticket.custom_fields?.[outcomeCustomFieldId]
                const outcomeValue = outcomeField?.value ?? ''
                const aiAgentOutcome = String(outcomeValue).includes('Handover')
                    ? AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
                    : AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated

                return {
                    id: ticket.id,
                    title: ticket.subject || `Ticket #${ticket.id}`,
                    lastUpdatedDatetime: new Date(
                        ticket.created_datetime || Date.now(),
                    ),
                    messageCount: ticket.messages?.length || 1,
                    aiAgentOutcome,
                }
            })

        return tickets.length > 0 ? tickets : null
    }, [
        enabled,
        ticketIds,
        ticket1.data,
        ticket2.data,
        ticket3.data,
        outcomeCustomFieldId,
    ])

    // Aggregate loading and error states
    const isLoading =
        enabled &&
        (isMetricsFetching ||
            (ticketIds.length > 0 && ticket1.isLoading) ||
            (ticketIds.length > 1 && ticket2.isLoading) ||
            (ticketIds.length > 2 && ticket3.isLoading))

    const isError =
        enabled &&
        (isMetricsError ||
            (ticketIds.length > 0 && ticket1.isError) ||
            (ticketIds.length > 1 && ticket2.isError) ||
            (ticketIds.length > 2 && ticket3.isError))

    return {
        data: transformedData,
        isLoading,
        isError,
    }
}

export type RecentTicketsWithDrilldown = {
    ticketCount: number
    latest3Tickets?: RecentTicket[]
    isLoading: boolean
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
    outcomeCustomFieldId: number
    intentCustomFieldId: number
}

type UseRecentTicketsWithDrilldownParams = {
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    timezone: string
    enabled: boolean
    ticketCount: number
    ticketCountIsLoading: boolean
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
}

type UseRecentTicketsWithDrilldownResult =
    | RecentTicketsWithDrilldown
    | undefined

/**
 * Hook to fetch recent tickets data with drilldown information
 */
export function useRecentTicketsWithDrilldown({
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    timezone,
    enabled,
    ticketCount,
    ticketCountIsLoading,
    dateRange,
}: UseRecentTicketsWithDrilldownParams): UseRecentTicketsWithDrilldownResult {
    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const recentTicketsData = useRecentTickets({
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        timezone,
        enabled,
        dateRange,
    })

    return useMemo(() => {
        if (!enabled) return undefined

        const isLoading = ticketCountIsLoading || recentTicketsData.isLoading

        if (isLoading) {
            return {
                ticketCount,
                isLoading: true,
                resourceSourceId,
                resourceSourceSetId,
                shopIntegrationId,
                dateRange,
                outcomeCustomFieldId,
                intentCustomFieldId,
            }
        }

        if (ticketCount === 0 && !recentTicketsData.data) {
            return undefined
        }

        return {
            ticketCount,
            latest3Tickets: recentTicketsData.data ?? undefined,
            isLoading: false,
            resourceSourceId,
            resourceSourceSetId,
            shopIntegrationId,
            dateRange,
            outcomeCustomFieldId,
            intentCustomFieldId,
        }
    }, [
        enabled,
        ticketCountIsLoading,
        recentTicketsData.isLoading,
        recentTicketsData.data,
        ticketCount,
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        dateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
    ])
}

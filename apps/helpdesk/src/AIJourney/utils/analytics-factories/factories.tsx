import { JOURNEY_COMPLETE_REASON } from 'AIJourney/constants'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'

export const aiJourneyRevenueQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentOrdersDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_GMV_INFLUENCED,
        measures: [AiSalesAgentOrdersMeasure.Gmv],
        dimensions: [AiSalesAgentOrdersDimension.Currency],
        filters: [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentOrdersDimension.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyRevenueTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    return {
        ...aiJourneyRevenueQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_GMV_INFLUENCED_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentOrdersDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalNumberOfOrderQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentOrdersDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_NUMBER_OF_ORDER,
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentOrdersDimension.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            ...baseFilters,
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyOrderMeasuresPerJourneyQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentOrdersDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_ORDERS_MEASURES_PER_JOURNEY,
        measures: [
            AiSalesAgentOrdersMeasure.Gmv,
            AiSalesAgentOrdersMeasure.Count,
            AiSalesAgentOrdersMeasure.AverageOrderValue,
        ],
        dimensions: [AiSalesAgentOrdersDimension.JourneyId],
        filters: [
            {
                member: AiSalesAgentOrdersDimension.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            ...baseFilters,
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalNumberOfOrderTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    return {
        ...aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_NUMBER_OF_ORDER_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentOrdersDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalNumberOfSalesConversationsQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_NUMBER_OF_SALES_CONVERSATIONS,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyConversationMesuresPerJourneyQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_CONVERSATION_MEASURES_PER_JOURNEY,
        measures: [
            AiSalesAgentConversationsMeasure.Count,
            AiSalesAgentConversationsMeasure.AiJourneyTotalMessages,
            AiSalesAgentConversationsMeasure.ClickThroughRate,
            AiSalesAgentConversationsMeasure.ReplyRate,
            AiSalesAgentConversationsMeasure.OptOutRate,
        ],
        dimensions: [AiSalesAgentConversationsDimension.JourneyId],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName:
            METRIC_NAMES.AI_JOURNEY_TOTAL_NUMBER_OF_SALES_CONVERSATIONS_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyRepliedMessagesQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_REPLIED_MESSAGES,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentConversationsDimension.Replied,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentConversationsDimension.JourneyCompleteReason,
                operator: ReportingFilterOperator.NotEquals,
                values: [JOURNEY_COMPLETE_REASON.OPTED_OUT],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyOptedOutQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_OPTED_OUT_CONVERSATIONS,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentConversationsDimension.JourneyCompleteReason,
                operator: ReportingFilterOperator.Equals,
                values: [JOURNEY_COMPLETE_REASON.OPTED_OUT],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyOptedOutTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyOptedOutQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_OPTED_OUT_CONVERSATIONS_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyRepliedMessagesTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyRepliedMessagesQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_REPLIED_MESSAGES_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyFailedMessagesQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_FAILED_MESSAGES,
        measures: [
            AiSalesAgentConversationsMeasure.AiJourneyTotalFailedMessages,
        ],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyFailedMessagesTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyFailedMessagesQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_FAILED_MESSAGES_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyUniqClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_UNIQ_CLICKS,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentConversationsDimension.Clicked,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyUniqClicksTimeSeriesQuery = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    integrationId: string,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyUniqClicksQueryFactory(
            filters,
            timezone,
            integrationId,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_UNIQ_CLICKS_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalConversationsQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_CONVERSATIONS,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalConversationsTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalConversationsQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_CONVERSATIONS_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalContactsCompleteJourneyQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_CONTACTS_COMPLETE_JOURNEY,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentConversationsDimension.JourneyState,
                operator: ReportingFilterOperator.Equals,
                values: ['completed'],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalContactsCompleteJourneyTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalContactsCompleteJourneyQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName:
            METRIC_NAMES.AI_JOURNEY_TOTAL_CONTACTS_COMPLETE_JOURNEY_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalContactsActiveQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_CONTACTS_ACTIVE,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentConversationsDimension.JourneyState,
                operator: ReportingFilterOperator.NotEquals,
                values: ['completed', 'cancelled'],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalContactsActiveTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalContactsActiveQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_CONTACTS_ACTIVE_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalUniqueContactsQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_UNIQUE_CONTACTS,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalUniqueContactsTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalUniqueContactsQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_UNIQUE_CONTACTS_TIME_SERIES,
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const AIJourneyDiscountCodesOfferedQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentConversationsDimension.DiscountCode,
                operator: ReportingFilterOperator.Set,
                values: [],
            },
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.AiJourney],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
        metricName: METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED,
    }
}

export const AIJourneyDiscountCodesUsedQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const journeyFilter =
        journeyIds && journeyIds.length > 0
            ? [
                  {
                      member: AiSalesAgentOrdersDimension.JourneyId,
                      operator: ReportingFilterOperator.Equals,
                      values: journeyIds,
                  },
              ]
            : []

    return {
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentOrdersDimension.InfluencedBy,
                operator: ReportingFilterOperator.Equals,
                values: ['discount-code'],
            },
            {
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.AiJourney],
            },
            {
                member: AiSalesAgentOrdersDimension.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
        metricName: METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_APPLIED,
    }
}

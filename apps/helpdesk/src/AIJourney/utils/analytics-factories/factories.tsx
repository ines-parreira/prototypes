import { JOURNEY_COMPLETE_REASON } from 'AIJourney/constants'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AiSalesAgentConversationsCube,
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'

export const aiJourneyGmvInfluencedQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentOrdersDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_GMV_INFLUENCED,
        measures: [AiSalesAgentOrdersMeasure.GmvUsd],
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

export const aiJourneyGmvInfluencedTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    return {
        ...aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyId,
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
    journeyId?: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentOrdersDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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

export const aiJourneyTotalNumberOfOrderTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentOrdersCube> => {
    return {
        ...aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyId,
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
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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

export const aiJourneyTotalNumberOfSalesConversationsTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalNumberOfSalesConversationsQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyId,
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
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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

export const aiJourneyRepliedMessagesTimeSeriesQuery = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyRepliedMessagesQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyId,
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

export const aiJourneyUniqClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyUniqClicksQueryFactory(
            filters,
            timezone,
            integrationId,
            journeyId,
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
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentConversationsDefaultFiltersMembers,
        filters,
    )

    const journeyIdFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        metricName: METRIC_NAMES.AI_JOURNEY_TOTAL_CONVERSATIONS,
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            ...journeyIdFilter,
            ...baseFilters,
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
        ],
        timezone,
    }
}

export const aiJourneyTotalContactsCompleteJourneyQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalContactsCompleteJourneyQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyId,
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
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
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
    journeyId?: string,
): TimeSeriesQuery<AiSalesAgentConversationsCube> => {
    return {
        ...aiJourneyTotalContactsActiveQueryFactory(
            integrationId,
            filters,
            timezone,
            journeyId,
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

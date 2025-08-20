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
        timeDimensions: [
            {
                dimension: AiSalesAgentConversationsDimension.PeriodStart,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
    }
}

export const aiJourneyTotalMessagesQueryFactory = (
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
        measures: [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages],
        dimensions: [],
        filters: [...journeyIdFilter, ...baseFilters],
        timezone,
    }
}

import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    articleRecommendedInteractionsTimeSeriesQueryFactory,
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/timeseries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

export function useAutomationDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return useTimeSeries(
        interactionsTimeSeriesQueryFactory(filters, timezone, granularity),
    )
}

export function fetchAutomationDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return fetchTimeSeries(
        interactionsTimeSeriesQueryFactory(filters, timezone, granularity),
    )
}

export function useAutomationDatasetByEventTypeTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return useTimeSeriesPerDimension(
        interactionsByEventTypeTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )
}

export function fetchAutomationDatasetByEventTypeTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return fetchTimeSeriesPerDimension(
        interactionsByEventTypeTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )
}

export function useBillableTicketDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId?: number,
) {
    return useTimeSeries(
        billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            aiAgentUserId,
        ),
    )
}

export function fetchBillableTicketDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId?: number,
) {
    return fetchTimeSeries(
        billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            aiAgentUserId,
        ),
    )
}

export function fetchRecommendedResourcesTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) {
    return fetchTimeSeries(
        articleRecommendedInteractionsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )
}

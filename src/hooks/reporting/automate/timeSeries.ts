import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/timeseries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

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
    aiAgentUserId?: string,
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
    aiAgentUserId?: string,
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

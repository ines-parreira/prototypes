import {
    fetchTimeSeries,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'

import {
    interactionsByEventTypeTimeSeriesQueryFactory,
    interactionsTimeSeriesQueryFactory,
    billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/timeseries'
import {closedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {messagesSentTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {ticketsCreatedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedTimeSeriesQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {customFieldsTicketCountTimeSeriesQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {tagsTicketCountTimeSeriesFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {ReportingGranularity, TimeSeriesQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

type TimeSeriesQueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) => TimeSeriesQuery<TCube>

type TimeSeriesPerDimensionQueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection
) => TimeSeriesQuery<TCube>

const getTimeSeriesHook =
    <TCube extends Cubes>(query: TimeSeriesQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity
    ) => {
        return useTimeSeries(query(filters, timezone, granularity))
    }

const getTimeSeriesFetch =
    <TCube extends Cubes>(query: TimeSeriesQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity
    ) => {
        return fetchTimeSeries(query(filters, timezone, granularity))
    }

const getTimeSeriesPerDimensionHook =
    <TCube extends Cubes>(query: TimeSeriesPerDimensionQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
        sorting?: OrderDirection
    ) => {
        return useTimeSeriesPerDimension(
            query(filters, timezone, granularity, sorting)
        )
    }

export const useTicketsCreatedTimeSeries = getTimeSeriesHook(
    ticketsCreatedTimeSeriesQueryFactory
)
export const fetchTicketsCreatedTimeSeries = getTimeSeriesFetch(
    ticketsCreatedTimeSeriesQueryFactory
)

export const useTicketsClosedTimeSeries = getTimeSeriesHook(
    closedTicketsTimeSeriesQueryFactory
)
export const fetchTicketsClosedTimeSeries = getTimeSeriesFetch(
    closedTicketsTimeSeriesQueryFactory
)

export const useTicketsRepliedTimeSeries = getTimeSeriesHook(
    ticketsRepliedTimeSeriesQueryFactory
)
export const fetchTicketsRepliedTimeSeries = getTimeSeriesFetch(
    ticketsRepliedTimeSeriesQueryFactory
)

export const useMessagesSentTimeSeries = getTimeSeriesHook(
    messagesSentTimeSeriesQueryFactory
)
export const fetchMessagesSentTimeSeries = getTimeSeriesFetch(
    messagesSentTimeSeriesQueryFactory
)

export const useCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    sorting?: OrderDirection
) => {
    return useTimeSeriesPerDimension(
        customFieldsTicketCountTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            customFieldId,
            sorting
        )
    )
}

export const useTagsTicketCountTimeSeries = getTimeSeriesPerDimensionHook(
    tagsTicketCountTimeSeriesFactory
)

// Automate V2
export function useAutomationDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeries(
        interactionsTimeSeriesQueryFactory(filters, timezone, granularity)
    )
}

export function useAutomationDatasetByEventTypeTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) {
    return useTimeSeriesPerDimension(
        interactionsByEventTypeTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity
        )
    )
}

export function useBillableTicketDatasetTimeSeries(
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId?: string
) {
    return useTimeSeries(
        billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            aiAgentUserId
        )
    )
}

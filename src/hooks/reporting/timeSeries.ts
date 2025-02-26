import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { Cubes } from 'models/reporting/cubes'
import { closedTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { messagesSentTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import { customFieldsTicketCountTimeSeriesQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { tagsTicketCountTimeSeriesFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { ReportingGranularity, TimeSeriesQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

type TimeSeriesQueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => TimeSeriesQuery<TCube>

type TimeSeriesPerDimensionQueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
) => TimeSeriesQuery<TCube>

const getTimeSeriesHook =
    <TCube extends Cubes>(query: TimeSeriesQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
    ) => {
        return useTimeSeries(query(filters, timezone, granularity))
    }

const getTimeSeriesFetch =
    <TCube extends Cubes>(query: TimeSeriesQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
    ) => {
        return fetchTimeSeries(query(filters, timezone, granularity))
    }

const getTimeSeriesPerDimensionHook =
    <TCube extends Cubes>(query: TimeSeriesPerDimensionQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
        sorting?: OrderDirection,
    ) => {
        return useTimeSeriesPerDimension(
            query(filters, timezone, granularity, sorting),
        )
    }

const getTimeSeriesPerDimensionFetch =
    <TCube extends Cubes>(query: TimeSeriesPerDimensionQueryFactory<TCube>) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity,
        sorting?: OrderDirection,
    ) => {
        return fetchTimeSeriesPerDimension(
            query(filters, timezone, granularity, sorting),
        )
    }

export const useTicketsCreatedTimeSeries = getTimeSeriesHook(
    ticketsCreatedTimeSeriesQueryFactory,
)
export const fetchTicketsCreatedTimeSeries = getTimeSeriesFetch(
    ticketsCreatedTimeSeriesQueryFactory,
)

export const useTicketsClosedTimeSeries = getTimeSeriesHook(
    closedTicketsTimeSeriesQueryFactory,
)
export const fetchTicketsClosedTimeSeries = getTimeSeriesFetch(
    closedTicketsTimeSeriesQueryFactory,
)

export const useTicketsRepliedTimeSeries = getTimeSeriesHook(
    ticketsRepliedTimeSeriesQueryFactory,
)
export const fetchTicketsRepliedTimeSeries = getTimeSeriesFetch(
    ticketsRepliedTimeSeriesQueryFactory,
)

export const useMessagesSentTimeSeries = getTimeSeriesHook(
    messagesSentTimeSeriesQueryFactory,
)

export const fetchMessagesSentTimeSeries = getTimeSeriesFetch(
    messagesSentTimeSeriesQueryFactory,
)

export const useOneTouchTicketsTimeSeries = getTimeSeriesHook(
    oneTouchTicketsTimeSeriesQueryFactory,
)

export const fetchOneTouchTicketsTimeSeries = getTimeSeriesFetch(
    oneTouchTicketsTimeSeriesQueryFactory,
)

export const useZeroTouchTicketsTimeSeries = getTimeSeriesHook(
    zeroTouchTicketsTimeSeriesQueryFactory,
)

export const fetchZeroTouchTicketsTimeSeries = getTimeSeriesFetch(
    zeroTouchTicketsTimeSeriesQueryFactory,
)

export const useCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    sorting?: OrderDirection,
    enabled = true,
) => {
    return useTimeSeriesPerDimension(
        customFieldsTicketCountTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            customFieldId,
            sorting,
        ),
        enabled,
    )
}

export const fetchCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    sorting?: OrderDirection,
) =>
    fetchTimeSeriesPerDimension(
        customFieldsTicketCountTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            customFieldId,
            sorting,
        ),
    )

export const useTagsTicketCountTimeSeries = getTimeSeriesPerDimensionHook(
    tagsTicketCountTimeSeriesFactory,
)
export const fetchTagsTicketCountTimeSeries = getTimeSeriesPerDimensionFetch(
    tagsTicketCountTimeSeriesFactory,
)

import { Sentiments } from 'hooks/reporting/types'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { Cubes } from 'models/reporting/cubes'
import { TicketCustomFieldsDimension } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { closedTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { messagesReceivedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesReceived'
import { messagesSentTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsTimeSeriesQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    tagsTicketCountOnCreatedDatetimeTimeSeriesFactory,
    tagsTicketCountTimeSeriesFactory,
    totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory,
    totalTaggedTicketCountTimeSeriesFactory,
} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters, TicketTimeReference } from 'models/stat/types'

type TimeSeriesQueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
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

export const useMessagesReceivedTimeSeries = getTimeSeriesHook(
    messagesReceivedTimeSeriesQueryFactory,
)

export const fetchMessagesReceivedTimeSeries = getTimeSeriesFetch(
    messagesReceivedTimeSeriesQueryFactory,
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
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? customFieldsTicketCountTimeSeriesQueryFactory
            : customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory

    return useTimeSeriesPerDimension(
        queryFactory(filters, timezone, granularity, customFieldId, sorting),
        enabled,
    )
}

export const useSentimentsCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sentimentCustomFieldId: string,
    sentimentValueStrings: Sentiments[],
    sorting?: OrderDirection,
    enabled = true,
) => {
    const queryFactory = customFieldsTicketCountTimeSeriesQueryFactory(
        filters,
        timezone,
        granularity,
        sentimentCustomFieldId,
        sorting,
    )

    return useTimeSeriesPerDimension(
        {
            ...queryFactory,
            filters: [
                ...queryFactory.filters,
                {
                    member: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.Equals,
                    values: sentimentValueStrings,
                },
            ],
        },
        enabled,
    )
}

export const useCustomFieldsTicketCountForProductTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: string,
    productId: string,
    sorting?: OrderDirection,
    enabled = true,
) => {
    return useTimeSeriesPerDimension(
        customFieldsTicketCountForProductOnCreatedDatetimeTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
            customFieldId,
            productId,
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
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? customFieldsTicketCountTimeSeriesQueryFactory
            : customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory

    return fetchTimeSeriesPerDimension(
        queryFactory(filters, timezone, granularity, customFieldId, sorting),
    )
}

export const useTagsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? tagsTicketCountTimeSeriesFactory
            : tagsTicketCountOnCreatedDatetimeTimeSeriesFactory

    return useTimeSeriesPerDimension(
        queryFactory(filters, timezone, granularity, sorting),
    )
}

export const fetchTagsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? tagsTicketCountTimeSeriesFactory
            : tagsTicketCountOnCreatedDatetimeTimeSeriesFactory

    return fetchTimeSeriesPerDimension(
        queryFactory(filters, timezone, granularity, sorting),
    )
}

export const useTotalTaggedTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? totalTaggedTicketCountTimeSeriesFactory
            : totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory

    return useTimeSeries(queryFactory(filters, timezone, granularity, sorting))
}

export const fetchTotalTaggedTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? totalTaggedTicketCountTimeSeriesFactory
            : totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory

    return fetchTimeSeries(
        queryFactory(filters, timezone, granularity, sorting),
    )
}

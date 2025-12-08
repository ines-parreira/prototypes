import type { MetricName } from 'domains/reporting/hooks/metricNames'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import type { Cubes } from 'domains/reporting/models/cubes'
import { TicketProductsEnrichedDimension } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { closedTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { messagesReceivedTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory,
    customFieldsTicketCountTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    tagsTicketCountOnCreatedDatetimeTimeSeriesFactory,
    tagsTicketCountTimeSeriesFactory,
    totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory,
    totalTaggedTicketCountTimeSeriesFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount'
import { intentsWithProductsTicketCountTimeseriesQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/intentPerProductQueryFactory'
import { messagesReceivedTimeSeriesQueryV2Factory } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import type {
    BuiltQuery,
    Context,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { closedTicketsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import type {
    AggregationWindow,
    Sentiment,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { OrderDirection } from 'models/api/types'

type TimeSeriesQueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => TimeSeriesQuery<TCube>

type BuiltTimeSeriesQueryFactory<
    TMeta extends ScopeMeta,
    TMetricName extends MetricName,
> = (ctx: Context) => BuiltQuery<TMeta, TMetricName>

const getTimeSeriesHook =
    <
        TCube extends Cubes,
        TMeta extends ScopeMeta,
        TMetricName extends MetricName,
    >(
        query: TimeSeriesQueryFactory<TCube>,
        queryV2?: BuiltTimeSeriesQueryFactory<TMeta, TMetricName>,
    ) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: AggregationWindow,
    ) => {
        return useTimeSeries(
            query(filters, timezone, granularity),
            queryV2?.({
                filters,
                timezone,
                granularity: granularity,
            }),
        )
    }

const getTimeSeriesFetch =
    <
        TCube extends Cubes,
        TMeta extends ScopeMeta,
        TMetricName extends MetricName,
    >(
        query: TimeSeriesQueryFactory<TCube>,
        queryV2?: BuiltTimeSeriesQueryFactory<TMeta, TMetricName>,
    ) =>
    (
        filters: StatsFilters,
        timezone: string,
        granularity: AggregationWindow,
    ) => {
        return fetchTimeSeries(
            query(filters, timezone, granularity),
            queryV2?.({
                filters,
                timezone,
                granularity: granularity,
            }),
        )
    }

export const useTicketsCreatedTimeSeries = getTimeSeriesHook(
    ticketsCreatedTimeSeriesQueryFactory,
    createdTicketsTimeseriesQueryV2Factory,
)
export const fetchTicketsCreatedTimeSeries = getTimeSeriesFetch(
    ticketsCreatedTimeSeriesQueryFactory,
    createdTicketsTimeseriesQueryV2Factory,
)

export const useTicketsClosedTimeSeries = getTimeSeriesHook(
    closedTicketsTimeSeriesQueryFactory,
    closedTicketsTimeseriesQueryV2Factory,
)
export const fetchTicketsClosedTimeSeries = getTimeSeriesFetch(
    closedTicketsTimeSeriesQueryFactory,
    closedTicketsTimeseriesQueryV2Factory,
)

export const useTicketsRepliedTimeSeries = getTimeSeriesHook(
    ticketsRepliedTimeSeriesQueryFactory,
    ticketsRepliedTimeseriesQueryV2Factory,
)
export const fetchTicketsRepliedTimeSeries = getTimeSeriesFetch(
    ticketsRepliedTimeSeriesQueryFactory,
    ticketsRepliedTimeseriesQueryV2Factory,
)

export const useMessagesSentTimeSeries = getTimeSeriesHook(
    messagesSentTimeSeriesQueryFactory,
    sentMessagesTimeseriesQueryV2Factory,
)

export const fetchMessagesSentTimeSeries = getTimeSeriesFetch(
    messagesSentTimeSeriesQueryFactory,
    sentMessagesTimeseriesQueryV2Factory,
)

export const useMessagesReceivedTimeSeries = getTimeSeriesHook(
    messagesReceivedTimeSeriesQueryFactory,
    messagesReceivedTimeSeriesQueryV2Factory,
)

export const fetchMessagesReceivedTimeSeries = getTimeSeriesFetch(
    messagesReceivedTimeSeriesQueryFactory,
    messagesReceivedTimeSeriesQueryV2Factory,
)

export const useOneTouchTicketsTimeSeries = getTimeSeriesHook(
    oneTouchTicketsTimeSeriesQueryFactory,
    oneTouchTicketsTimeseriesQueryV2Factory,
)

export const fetchOneTouchTicketsTimeSeries = getTimeSeriesFetch(
    oneTouchTicketsTimeSeriesQueryFactory,
    oneTouchTicketsTimeseriesQueryV2Factory,
)

export const useZeroTouchTicketsTimeSeries = getTimeSeriesHook(
    zeroTouchTicketsTimeSeriesQueryFactory,
)

export const fetchZeroTouchTicketsTimeSeries = getTimeSeriesFetch(
    zeroTouchTicketsTimeSeriesQueryFactory,
)
// P2/P3
export const useCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: number,
    sorting?: OrderDirection,
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? customFieldsTicketCountTimeSeriesQueryFactory
            : customFieldsTicketCountOnCreatedDatetimeTimeSeriesQueryFactory

    return useTimeSeriesPerDimension(
        queryFactory(filters, timezone, granularity, customFieldId, sorting),
    )
}
// P2/P3
export const useAIIntentCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: number,
    sorting?: OrderDirection,
) => {
    const query = customFieldsTicketCountTimeSeriesQueryFactory(
        filters,
        timezone,
        granularity,
        customFieldId,
        sorting,
    )

    return useTimeSeriesPerDimension({
        ...query,
        filters: [
            ...query.filters,
            {
                member: TicketProductsEnrichedDimension.ProductId,
                operator: ReportingFilterOperator.NotEquals,
                values: ['null'],
            },
        ],
    })
}
// P2/P3
export const useSentimentsCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sentimentCustomFieldId: number,
    sentimentValueStrings: Sentiment[],
    sorting?: OrderDirection,
) =>
    useTimeSeriesPerDimension(
        intentsWithProductsTicketCountTimeseriesQueryFactory(
            filters,
            timezone,
            granularity,
            sentimentCustomFieldId,
            sentimentValueStrings,
            sorting,
        ),
    )
// P2/P3
export const useCustomFieldsTicketCountForProductTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: number,
    productId: string,
    sorting?: OrderDirection,
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
    )
}

export const fetchCustomFieldsTicketCountTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    customFieldId: number,
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

// P2/P3
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

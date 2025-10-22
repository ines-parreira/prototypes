import { MetricName } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    fetchShouldIncludeBots,
    useShouldIncludeBots,
} from 'domains/reporting/hooks/useShouldIncludeBots'
import { Cubes } from 'domains/reporting/models/cubes'
import { onlineTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import {
    medianFirstAgentResponseTimeQueryFactory,
    medianFirstResponseTimeQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesPerTicketQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesPerTicket'
import { messagesReceivedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { openTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/openTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { medianFirstResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { messagesPerTicketCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesPerTicket'
import { sentMessagesCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTimeQueryV2Factory } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import {
    MetricQueryFactory,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { ticketAverageHandleTimeQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { openTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsOpen'
import { ticketsRepliedCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import {
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

type QueryFactory<TCube extends Cubes> = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => ReportingQuery<TCube>

export const getTrendFetch =
    <TCube extends Cubes>(query: QueryFactory<TCube>) =>
    (filters: StatsFiltersWithLogicalOperator, timezone: string) => {
        return fetchMetricTrend(
            query(filters, timezone),
            query(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            ),
        )
    }

export const getTrendHook =
    <
        TCube extends Cubes,
        TMeta extends ScopeMeta,
        TMetricName extends MetricName,
    >(
        query: QueryFactory<TCube>,
        queryV2?: MetricQueryFactory<TMeta, TMetricName>,
    ) =>
    (filters: StatsFilters, timezone: string) =>
        useMetricTrend(
            query(filters, timezone),
            query(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            ),
            queryV2?.({
                filters,
                timezone,
            }),
            queryV2?.({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            }),
        )

export const useCustomerSatisfactionTrend = getTrendHook(
    customerSatisfactionQueryFactory,
)
export const fetchCustomerSatisfactionTrend = getTrendFetch(
    customerSatisfactionQueryFactory,
)

export const useMedianFirstResponseTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const shouldIncludeBots = useShouldIncludeBots()

    const queryFactory = shouldIncludeBots
        ? medianFirstResponseTimeQueryFactory
        : medianFirstAgentResponseTimeQueryFactory

    return useMetricTrend(
        queryFactory(filters, timezone),
        queryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        medianFirstResponseTimeQueryV2Factory({
            filters,
            timezone,
        }),
        medianFirstResponseTimeQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchMedianFirstResponseTimeTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const shouldIncludeBots = await fetchShouldIncludeBots()

    const queryFactory = shouldIncludeBots
        ? medianFirstResponseTimeQueryFactory
        : medianFirstAgentResponseTimeQueryFactory

    return fetchMetricTrend(
        queryFactory(filters, timezone),
        queryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
}

export const useMedianResponseTimeTrend = getTrendHook(
    medianResponseTimeQueryFactory,
)

export const fetchMedianResponseTimeTrend = getTrendFetch(
    medianResponseTimeQueryFactory,
)

export const fetchHumanResponseTimeAfterAiHandoffTrend = getTrendFetch(
    humanResponseTimeAfterAiHandoffQueryFactory,
)

export const useHumanResponseTimeAfterAiHandoffTrend = getTrendHook(
    humanResponseTimeAfterAiHandoffQueryFactory,
)

export const useMessagesPerTicketTrend = getTrendHook(
    messagesPerTicketQueryFactory,
    messagesPerTicketCountQueryV2Factory,
)

export const fetchMessagesPerTicketTrend = getTrendFetch(
    messagesPerTicketQueryFactory,
)

export const useMedianResolutionTimeTrend = getTrendHook(
    medianResolutionTimeQueryFactory,
    medianResolutionTimeQueryV2Factory,
)

export const fetchMedianResolutionTimeTrend = getTrendFetch(
    medianResolutionTimeQueryFactory,
)

export const useOpenTicketsTrend = getTrendHook(
    openTicketsQueryFactory,
    openTicketsCountQueryV2Factory,
)

export const fetchOpenTicketsTrend = getTrendFetch(openTicketsQueryFactory)

export const useClosedTicketsTrend = getTrendHook(
    closedTicketsQueryFactory,
    closedTicketsCountQueryV2Factory,
)

export const fetchClosedTicketsTrend = getTrendFetch(closedTicketsQueryFactory)

export const useOneTouchTicketsTrend = getTrendHook(
    oneTouchTicketsQueryFactory,
    oneTouchTicketsQueryV2Factory,
)

export const fetchOneTouchTicketsTrend = getTrendFetch(
    oneTouchTicketsQueryFactory,
)

export const useZeroTouchTicketsTrend = getTrendHook(
    zeroTouchTicketsQueryFactory,
)

export const fetchZeroTouchTicketsTrend = getTrendFetch(
    zeroTouchTicketsQueryFactory,
)

export const useTicketsCreatedTrend = getTrendHook(
    ticketsCreatedQueryFactory,
    createdTicketsCountQueryV2Factory,
)

export const fetchTicketsCreatedTrend = getTrendFetch(
    ticketsCreatedQueryFactory,
)

export const useTicketsRepliedTrend = getTrendHook(
    ticketsRepliedQueryFactory,
    ticketsRepliedCountQueryV2Factory,
)

export const fetchTicketsRepliedTrend = getTrendFetch(
    ticketsRepliedQueryFactory,
)

export const useMessagesSentTrend = getTrendHook(
    messagesSentQueryFactory,
    sentMessagesCountQueryV2Factory,
)

export const fetchMessagesSentTrend = getTrendFetch(messagesSentQueryFactory)

export const useMessagesReceivedTrend = getTrendHook(
    messagesReceivedQueryFactory,
)

export const fetchMessagesReceivedTrend = getTrendFetch(
    messagesReceivedQueryFactory,
)

export const useTicketHandleTimeTrend = getTrendHook(
    ticketAverageHandleTimeQueryFactory,
    ticketAverageHandleTimeQueryV2Factory,
)

export const fetchTicketHandleTimeTrend = getTrendFetch(
    ticketAverageHandleTimeQueryFactory,
)

export const useOnlineTimeTrend = getTrendHook(
    onlineTimeQueryFactory,
    onlineTimeQueryV2Factory,
)

export const fetchOnlineTimeTrend = getTrendFetch(onlineTimeQueryFactory)

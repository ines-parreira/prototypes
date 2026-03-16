import type { MetricName } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import type { Cubes } from 'domains/reporting/models/cubes'
import { onlineTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstAgentResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
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
import { customerSatisfactionQueryV2Factory } from 'domains/reporting/models/scopes/customerSatisfaction'
import { medianFirstResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffQueryV2Factory } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesPerTicketCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesPerTicket'
import { messagesReceivedCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTimeQueryV2Factory } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { medianResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/responseTime'
import type {
    MetricQueryFactory,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { ticketAverageHandleTimeQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { openTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsOpen'
import { ticketsRepliedCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import { zeroTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type {
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

type QueryFactory<TCube extends Cubes> = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => ReportingQuery<TCube>

export const getTrendFetch =
    <
        TCube extends Cubes,
        TMeta extends ScopeMeta,
        TMetricName extends MetricName,
    >(
        query: QueryFactory<TCube>,
        queryV2?: MetricQueryFactory<TMeta, TMetricName>,
    ) =>
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
    (filters: StatsFilters, timezone: string, enabled: boolean = true) =>
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
            enabled,
        )

export const useCustomerSatisfactionTrend = getTrendHook(
    customerSatisfactionQueryFactory,
    customerSatisfactionQueryV2Factory,
)
export const fetchCustomerSatisfactionTrend = getTrendFetch(
    customerSatisfactionQueryFactory,
    customerSatisfactionQueryV2Factory,
)

export const useMedianFirstResponseTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useMetricTrend(
        medianFirstAgentResponseTimeQueryFactory(filters, timezone),
        medianFirstAgentResponseTimeQueryFactory(
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
    return fetchMetricTrend(
        medianFirstAgentResponseTimeQueryFactory(filters, timezone),
        medianFirstAgentResponseTimeQueryFactory(
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

export const useMedianResponseTimeTrend = getTrendHook(
    medianResponseTimeQueryFactory,
    medianResponseTimeQueryV2Factory,
)

export const fetchMedianResponseTimeTrend = getTrendFetch(
    medianResponseTimeQueryFactory,
    medianResponseTimeQueryV2Factory,
)

export const fetchHumanResponseTimeAfterAiHandoffTrend = getTrendFetch(
    humanResponseTimeAfterAiHandoffQueryFactory,
    humanResponseTimeAfterAiHandoffQueryV2Factory,
)

export const useHumanResponseTimeAfterAiHandoffTrend = getTrendHook(
    humanResponseTimeAfterAiHandoffQueryFactory,
    humanResponseTimeAfterAiHandoffQueryV2Factory,
)

export const useMessagesPerTicketTrend = getTrendHook(
    messagesPerTicketQueryFactory,
    messagesPerTicketCountQueryV2Factory,
)

export const fetchMessagesPerTicketTrend = getTrendFetch(
    messagesPerTicketQueryFactory,
    messagesPerTicketCountQueryV2Factory,
)

export const useMedianResolutionTimeTrend = getTrendHook(
    medianResolutionTimeQueryFactory,
    medianResolutionTimeQueryV2Factory,
)

export const fetchMedianResolutionTimeTrend = getTrendFetch(
    medianResolutionTimeQueryFactory,
    medianResolutionTimeQueryV2Factory,
)

export const useOpenTicketsTrend = getTrendHook(
    openTicketsQueryFactory,
    openTicketsCountQueryV2Factory,
)

export const fetchOpenTicketsTrend = getTrendFetch(
    openTicketsQueryFactory,
    openTicketsCountQueryV2Factory,
)

export const useClosedTicketsTrend = getTrendHook(
    closedTicketsQueryFactory,
    closedTicketsCountQueryV2Factory,
)

export const fetchClosedTicketsTrend = getTrendFetch(
    closedTicketsQueryFactory,
    closedTicketsCountQueryV2Factory,
)

export const useOneTouchTicketsTrend = getTrendHook(
    oneTouchTicketsQueryFactory,
    oneTouchTicketsQueryV2Factory,
)

export const fetchOneTouchTicketsTrend = getTrendFetch(
    oneTouchTicketsQueryFactory,
    oneTouchTicketsQueryV2Factory,
)

export const useZeroTouchTicketsTrend = getTrendHook(
    zeroTouchTicketsQueryFactory,
    zeroTouchTicketsQueryV2Factory,
)

export const fetchZeroTouchTicketsTrend = getTrendFetch(
    zeroTouchTicketsQueryFactory,
    zeroTouchTicketsQueryV2Factory,
)

export const useTicketsCreatedTrend = getTrendHook(
    ticketsCreatedQueryFactory,
    createdTicketsCountQueryV2Factory,
)

export const fetchTicketsCreatedTrend = getTrendFetch(
    ticketsCreatedQueryFactory,
    createdTicketsCountQueryV2Factory,
)

export const useTicketsRepliedTrend = getTrendHook(
    ticketsRepliedQueryFactory,
    ticketsRepliedCountQueryV2Factory,
)

export const fetchTicketsRepliedTrend = getTrendFetch(
    ticketsRepliedQueryFactory,
    ticketsRepliedCountQueryV2Factory,
)

export const useMessagesSentTrend = getTrendHook(
    messagesSentQueryFactory,
    sentMessagesCountQueryV2Factory,
)

export const fetchMessagesSentTrend = getTrendFetch(
    messagesSentQueryFactory,
    sentMessagesCountQueryV2Factory,
)

export const useMessagesReceivedTrend = getTrendHook(
    messagesReceivedQueryFactory,
    messagesReceivedCountQueryV2Factory,
)

export const fetchMessagesReceivedTrend = getTrendFetch(
    messagesReceivedQueryFactory,
    messagesReceivedCountQueryV2Factory,
)

export const useTicketHandleTimeTrend = getTrendHook(
    ticketAverageHandleTimeQueryFactory,
    ticketAverageHandleTimeQueryV2Factory,
)

export const fetchTicketHandleTimeTrend = getTrendFetch(
    ticketAverageHandleTimeQueryFactory,
    ticketAverageHandleTimeQueryV2Factory,
)

export const useOnlineTimeTrend = getTrendHook(
    onlineTimeQueryFactory,
    onlineTimeQueryV2Factory,
)

export const fetchOnlineTimeTrend = getTrendFetch(
    onlineTimeQueryFactory,
    onlineTimeQueryV2Factory,
)

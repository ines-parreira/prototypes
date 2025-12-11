import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import { onlineTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstAgentResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { medianFirstResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffQueryV2Factory } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesReceivedCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTimeQueryV2Factory } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { medianResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/responseTime'
import { ticketAverageHandleTimeQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import { zeroTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export type Metric = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
    }
}

export const useTicketsCreatedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        ticketsCreatedQueryFactory(statsFilters, timezone),
        createdTicketsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchTicketsCreatedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        ticketsCreatedQueryFactory(statsFilters, timezone),
        createdTicketsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const useClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        closedTicketsQueryFactory(statsFilters, timezone),
        closedTicketsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        closedTicketsQueryFactory(statsFilters, timezone),
        closedTicketsCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )
// P2/P3
export const useCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => useMetric(customerSatisfactionQueryFactory(statsFilters, timezone))
// P2/P3
export const fetchCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(customerSatisfactionQueryFactory(statsFilters, timezone))

export const useMedianFirstResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    return useMetric(
        medianFirstAgentResponseTimeQueryFactory(statsFilters, timezone),
        medianFirstResponseTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )
}

export const fetchMedianFirstResponseTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return fetchMetric(
        medianFirstAgentResponseTimeQueryFactory(statsFilters, timezone),
        medianFirstResponseTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )
}
// P2/P3
export const useMedianResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        medianResponseTimeQueryFactory(statsFilters, timezone),
        medianResponseTimeQueryV2Factory({ filters: statsFilters, timezone }),
    )

export const fetchMedianResponseTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        medianResponseTimeQueryFactory(statsFilters, timezone),
        medianResponseTimeQueryV2Factory({ filters: statsFilters, timezone }),
    )
// P2/P3
export const useHumanResponseTimeAfterAiHandoffMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        humanResponseTimeAfterAiHandoffQueryFactory(statsFilters, timezone),
        humanResponseTimeAfterAiHandoffQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchHumanResponseTimeAfterAiHandoffMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        humanResponseTimeAfterAiHandoffQueryFactory(statsFilters, timezone),
        humanResponseTimeAfterAiHandoffQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const useMedianResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        medianResolutionTimeQueryFactory(statsFilters, timezone),
        medianResolutionTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchMedianResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        medianResolutionTimeQueryFactory(statsFilters, timezone),
        medianResolutionTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const useTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        ticketsRepliedQueryFactory(statsFilters, timezone),
        ticketsRepliedCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        ticketsRepliedQueryFactory(statsFilters, timezone),
        ticketsRepliedCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const useMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        messagesSentQueryFactory(statsFilters, timezone),
        sentMessagesCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        messagesSentQueryFactory(statsFilters, timezone),
        sentMessagesCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

// P2/P3
export const useMessagesReceivedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        messagesReceivedQueryFactory(statsFilters, timezone),
        messagesReceivedCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchMessagesReceivedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        messagesReceivedQueryFactory(statsFilters, timezone),
        messagesReceivedCountQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const useOneTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        oneTouchTicketsQueryFactory(statsFilters, timezone),
        oneTouchTicketsQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const fetchOneTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        oneTouchTicketsQueryFactory(statsFilters, timezone),
        oneTouchTicketsQueryV2Factory({
            filters: statsFilters,
            timezone,
        }),
    )

export const useZeroTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        zeroTouchTicketsQueryFactory(statsFilters, timezone),
        zeroTouchTicketsQueryV2Factory({ filters: statsFilters, timezone }),
    )

export const fetchZeroTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        zeroTouchTicketsQueryFactory(statsFilters, timezone),
        zeroTouchTicketsQueryV2Factory({ filters: statsFilters, timezone }),
    )

export const useTicketAverageHandleTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Metric =>
    useMetric(
        ticketAverageHandleTimeQueryFactory(statsFilters, timezone, sorting),
        ticketAverageHandleTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
    )

export const fetchTicketAverageHandleTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Promise<Metric> =>
    fetchMetric(
        ticketAverageHandleTimeQueryFactory(statsFilters, timezone, sorting),
        ticketAverageHandleTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
    )

export const useOnlineTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Metric =>
    useMetric(
        onlineTimeQueryFactory(statsFilters, timezone, sorting),
        onlineTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
    )

export const fetchOnlineTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Promise<Metric> =>
    fetchMetric(
        onlineTimeQueryFactory(statsFilters, timezone, sorting),
        onlineTimeQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
    )

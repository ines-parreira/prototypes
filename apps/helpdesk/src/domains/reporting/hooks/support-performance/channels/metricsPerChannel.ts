import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'domains/reporting/hooks/helpers'
import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    fetchShouldIncludeBots,
    useShouldIncludeBots,
} from 'domains/reporting/hooks/useShouldIncludeBots'
import { ticketAverageHandleTimePerAgentPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import {
    medianFirstAgentResponseTimePerChannelQueryFactory,
    medianFirstResponseTimeMetricPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedPerChannelPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { medianFirstResponseTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { sentMessagesPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { medianResolutionTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { ticketAverageHandleTimePerAgentPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedCountPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export type MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string,
    shouldIncludeBots?: boolean,
) => MetricWithDecile

export const useMedianFirstResponseTimeMetricPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    dimensionId?: string,
) => {
    const shouldIncludeBots = useShouldIncludeBots()

    const queryFactory = shouldIncludeBots
        ? medianFirstResponseTimeMetricPerChannelQueryFactory
        : medianFirstAgentResponseTimePerChannelQueryFactory

    return useMetricPerDimensionV2(
        queryFactory(statsFilters, timezone, sorting),
        medianFirstResponseTimePerChannelQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        dimensionId,
    )
}

export const fetchMedianFirstResponseTimeMetricPerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    dimensionId?: string,
) => {
    const shouldIncludeBots = await fetchShouldIncludeBots()

    const queryFactory = shouldIncludeBots
        ? medianFirstResponseTimeMetricPerChannelQueryFactory
        : medianFirstAgentResponseTimePerChannelQueryFactory

    return fetchMetricPerDimensionV2(
        queryFactory(statsFilters, timezone, sorting),
        medianFirstResponseTimePerChannelQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        dimensionId,
    )
}
// P2/P3
export const useMedianResponseTimeMetricPerChannel =
    createMetricPerDimensionHook(medianResponseTimeMetricPerChannelQueryFactory)

export const fetchMedianResponseTimeMetricPerChannel = createFetchPerDimension(
    medianResponseTimeMetricPerChannelQueryFactory,
)
// P2/P3
export const useHumanResponseTimeAfterAiHandoffPerChannel =
    createMetricPerDimensionHook(
        humanResponseTimeAfterAiHandoffPerChannelQueryFactory,
    )

export const fetchHumanResponseTimeAfterAiHandoffPerChannel =
    createFetchPerDimension(
        humanResponseTimeAfterAiHandoffPerChannelQueryFactory,
    )

export const useTicketsRepliedMetricPerChannel = createMetricPerDimensionHook(
    ticketsRepliedMetricPerChannelQueryFactory,
    ticketsRepliedCountPerChannelQueryV2Factory,
)
export const fetchTicketsRepliedMetricPerChannel = createFetchPerDimension(
    ticketsRepliedMetricPerChannelQueryFactory,
)

export const useClosedTicketsMetricPerChannel = createMetricPerDimensionHook(
    closedTicketsPerChannelQueryFactory,
    closedTicketsPerChannelQueryV2Factory,
)
export const fetchClosedTicketsMetricPerChannel = createFetchPerDimension(
    closedTicketsPerChannelQueryFactory,
)

export const useCreatedTicketsMetricPerChannel = createMetricPerDimensionHook(
    ticketsCreatedPerChannelPerChannelQueryFactory,
    createdTicketsPerChannelQueryV2Factory,
)

export const fetchCreatedTicketsMetricPerChannel = createFetchPerDimension(
    ticketsCreatedPerChannelPerChannelQueryFactory,
)
export const useMessagesSentMetricPerChannel = createMetricPerDimensionHook(
    messagesSentMetricPerChannelQueryFactory,
    sentMessagesPerChannelQueryV2Factory,
)
export const fetchMessagesSentMetricPerChannel = createFetchPerDimension(
    messagesSentMetricPerChannelQueryFactory,
)
export const useMessagesReceivedMetricPerChannel = createMetricPerDimensionHook(
    messagesReceivedMetricPerChannelQueryFactory,
)
export const fetchMessagesReceivedMetricPerChannel = createFetchPerDimension(
    messagesReceivedMetricPerChannelQueryFactory,
)
export const useMedianResolutionTimeMetricPerChannel =
    createMetricPerDimensionHook(
        medianResolutionTimeMetricPerChannelQueryFactory,
        medianResolutionTimePerChannelQueryV2Factory,
    )
export const fetchMedianResolutionTimeMetricPerChannel =
    createFetchPerDimension(
        medianResolutionTimeMetricPerChannelQueryFactory,
        medianResolutionTimePerChannelQueryV2Factory,
    )

export const useCustomerSatisfactionMetricPerChannel =
    createMetricPerDimensionHook(
        customerSatisfactionMetricPerChannelQueryFactory,
    )
export const fetchCustomerSatisfactionMetricPerChannel =
    createFetchPerDimension(customerSatisfactionMetricPerChannelQueryFactory)

export const useOneTouchTicketsMetricPerChannel = createMetricPerDimensionHook(
    oneTouchTicketsPerChannelQueryFactory,
    oneTouchTicketsPerChannelQueryV2Factory,
)
export const fetchOneTouchTicketsMetricPerChannel = createFetchPerDimension(
    oneTouchTicketsPerChannelQueryFactory,
)

export const useZeroTouchTicketsMetricPerChannel = createMetricPerDimensionHook(
    zeroTouchTicketsPerChannelQueryFactory,
)
export const fetchZeroTouchTicketsMetricPerChannel = createFetchPerDimension(
    zeroTouchTicketsPerChannelQueryFactory,
)

export const useTicketAverageHandleTimePerChannel =
    createMetricPerDimensionHook(
        ticketAverageHandleTimePerAgentPerChannelQueryFactory,
        ticketAverageHandleTimePerAgentPerChannelQueryV2Factory,
    )
export const fetchTicketAverageHandleTimePerChannel = createFetchPerDimension(
    ticketAverageHandleTimePerAgentPerChannelQueryFactory,
)

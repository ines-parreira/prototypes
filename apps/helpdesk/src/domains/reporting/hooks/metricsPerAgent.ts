import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'domains/reporting/hooks/helpers'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    fetchShouldIncludeBots,
    useShouldIncludeBots,
} from 'domains/reporting/hooks/useShouldIncludeBots'
import { onlineTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import {
    medianFirstAgentResponseTimePerAgentQueryFactory,
    medianFirstResponseTimeMetricPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsRepliedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { medianFirstResponseTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { sentMessagesPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { ticketAverageHandleTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { ticketsRepliedCountPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useMedianFirstResponseTimeMetricPerAgent = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    dimensionId?: string,
) => {
    const shouldIncludeBots = useShouldIncludeBots()

    const queryFactory = shouldIncludeBots
        ? medianFirstResponseTimeMetricPerAgentQueryFactory
        : medianFirstAgentResponseTimePerAgentQueryFactory

    return useMetricPerDimensionV2(
        queryFactory(filters, timezone, sorting),
        medianFirstResponseTimePerAgentQueryV2Factory({
            filters,
            timezone,
            sortDirection: sorting,
        }),
        dimensionId,
    )
}

export const fetchMedianFirstResponseTimeMetricPerAgent = async (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    dimensionId?: string,
) => {
    const shouldIncludeBots = await fetchShouldIncludeBots()

    const queryFactory = shouldIncludeBots
        ? medianFirstResponseTimeMetricPerAgentQueryFactory
        : medianFirstAgentResponseTimePerAgentQueryFactory

    return fetchMetricPerDimensionV2(
        queryFactory(filters, timezone, sorting),
        medianFirstResponseTimePerAgentQueryV2Factory({
            filters,
            timezone,
            sortDirection: sorting,
        }),
        dimensionId,
    )
}

export const useHumanResponseTimeAfterAiHandoffPerAgent =
    createMetricPerDimensionHook(
        humanResponseTimeAfterAiHandoffPerAgentQueryFactory,
    )

export const fetchHumanResponseTimeAfterAiHandoffPerAgent =
    createFetchPerDimension(humanResponseTimeAfterAiHandoffPerAgentQueryFactory)

export const useMedianResponseTimeMetricPerAgent = createMetricPerDimensionHook(
    medianResponseTimeMetricPerAgentQueryFactory,
)

export const fetchMedianResponseTimeMetricPerAgent = createFetchPerDimension(
    medianResponseTimeMetricPerAgentQueryFactory,
)

export const useTicketsRepliedMetricPerAgent = createMetricPerDimensionHook(
    ticketsRepliedMetricPerAgentQueryFactory,
    ticketsRepliedCountPerAgentQueryV2Factory,
)

export const fetchTicketsRepliedMetricPerAgent = createFetchPerDimension(
    ticketsRepliedMetricPerAgentQueryFactory,
)

export const useClosedTicketsMetricPerAgent = createMetricPerDimensionHook(
    closedTicketsPerAgentQueryFactory,
    closedTicketsPerAgentQueryV2Factory,
)

export const fetchClosedTicketsMetricPerAgent = createFetchPerDimension(
    closedTicketsPerAgentQueryFactory,
)

export const useMessagesSentMetricPerAgent = createMetricPerDimensionHook(
    messagesSentMetricPerAgentQueryFactory,
    sentMessagesPerAgentQueryV2Factory,
)

export const fetchMessagesSentMetricPerAgent = createFetchPerDimension(
    messagesSentMetricPerAgentQueryFactory,
)

export const useMessagesReceivedMetricPerAgent = createMetricPerDimensionHook(
    messagesReceivedMetricPerAgentQueryFactory,
)

export const fetchMessagesReceivedMetricPerAgent = createFetchPerDimension(
    messagesReceivedMetricPerAgentQueryFactory,
)

export const useMedianResolutionTimeMetricPerAgent =
    createMetricPerDimensionHook(
        medianResolutionTimeMetricPerAgentQueryFactory,
        medianResolutionTimePerAgentQueryV2Factory,
    )

export const fetchMedianResolutionTimeMetricPerAgent = createFetchPerDimension(
    medianResolutionTimeMetricPerAgentQueryFactory,
)

export const useCustomerSatisfactionMetricPerAgent =
    createMetricPerDimensionHook(customerSatisfactionMetricPerAgentQueryFactory)

export const fetchCustomerSatisfactionMetricPerAgent = createFetchPerDimension(
    customerSatisfactionMetricPerAgentQueryFactory,
)

export const useOneTouchTicketsMetricPerAgent = createMetricPerDimensionHook(
    oneTouchTicketsPerAgentQueryFactory,
    oneTouchTicketsPerAgentQueryV2Factory,
)

export const fetchOneTouchTicketsMetricPerAgent = createFetchPerDimension(
    oneTouchTicketsPerAgentQueryFactory,
)

export const useZeroTouchTicketsMetricPerAgent = createMetricPerDimensionHook(
    zeroTouchTicketsPerAgentQueryFactory,
)

export const fetchZeroTouchTicketsMetricPerAgent = createFetchPerDimension(
    zeroTouchTicketsPerAgentQueryFactory,
)

export const useOnlineTimePerAgent = createMetricPerDimensionHook(
    onlineTimePerAgentQueryFactory,
    onlineTimePerAgentQueryV2Factory,
)

export const fetchOnlineTimePerAgent = createFetchPerDimension(
    onlineTimePerAgentQueryFactory,
)

export const useTicketAverageHandleTimePerAgent = createMetricPerDimensionHook(
    ticketAverageHandleTimePerAgentQueryFactory,
    ticketAverageHandleTimePerAgentQueryV2Factory,
)

export const fetchTicketAverageHandleTimePerAgent = createFetchPerDimension(
    ticketAverageHandleTimePerAgentQueryFactory,
)

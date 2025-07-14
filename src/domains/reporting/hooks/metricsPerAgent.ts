import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'domains/reporting/hooks/helpers'
import { onlineTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { medianFirstResponseTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsRepliedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'

export const useMedianFirstResponseTimeMetricPerAgent =
    createMetricPerDimensionHook(
        medianFirstResponseTimeMetricPerAgentQueryFactory,
    )

export const fetchMedianFirstResponseTimeMetricPerAgent =
    createFetchPerDimension(medianFirstResponseTimeMetricPerAgentQueryFactory)

export const useMedianResponseTimeMetricPerAgent = createMetricPerDimensionHook(
    medianResponseTimeMetricPerAgentQueryFactory,
)

export const fetchMedianResponseTimeMetricPerAgent = createFetchPerDimension(
    medianResponseTimeMetricPerAgentQueryFactory,
)

export const useTicketsRepliedMetricPerAgent = createMetricPerDimensionHook(
    ticketsRepliedMetricPerAgentQueryFactory,
)

export const fetchTicketsRepliedMetricPerAgent = createFetchPerDimension(
    ticketsRepliedMetricPerAgentQueryFactory,
)

export const useClosedTicketsMetricPerAgent = createMetricPerDimensionHook(
    closedTicketsPerAgentQueryFactory,
)

export const fetchClosedTicketsMetricPerAgent = createFetchPerDimension(
    closedTicketsPerAgentQueryFactory,
)

export const useMessagesSentMetricPerAgent = createMetricPerDimensionHook(
    messagesSentMetricPerAgentQueryFactory,
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
    createMetricPerDimensionHook(medianResolutionTimeMetricPerAgentQueryFactory)

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
)

export const fetchOnlineTimePerAgent = createFetchPerDimension(
    onlineTimePerAgentQueryFactory,
)

export const useTicketAverageHandleTimePerAgent = createMetricPerDimensionHook(
    ticketAverageHandleTimePerAgentQueryFactory,
)

export const fetchTicketAverageHandleTimePerAgent = createFetchPerDimension(
    ticketAverageHandleTimePerAgentQueryFactory,
)

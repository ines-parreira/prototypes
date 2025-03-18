import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'hooks/reporting/metricsPerAgent'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { ticketAverageHandleTimePerAgentPerChannelQueryFactory } from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import { averageResponseTimeMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/averageResponseTime'
import { closedTicketsPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { medianFirstResponseTimeMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import { messagesReceivedMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedPerChannelPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerChannelQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import { StatsFilters } from 'models/stat/types'

export type MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string,
) => MetricWithDecile

export const useMedianFirstResponseTimeMetricPerChannel =
    createMetricPerDimensionHook(
        medianFirstResponseTimeMetricPerChannelQueryFactory,
    )

export const fetchMedianFirstResponseTimeMetricPerChannel =
    createFetchPerDimension(medianFirstResponseTimeMetricPerChannelQueryFactory)

export const useAverageResponseTimeMetricPerChannel =
    createMetricPerDimensionHook(
        averageResponseTimeMetricPerChannelQueryFactory,
    )

export const fetchAverageResponseTimeMetricPerChannel = createFetchPerDimension(
    averageResponseTimeMetricPerChannelQueryFactory,
)

export const useTicketsRepliedMetricPerChannel = createMetricPerDimensionHook(
    ticketsRepliedMetricPerChannelQueryFactory,
)
export const fetchTicketsRepliedMetricPerChannel = createFetchPerDimension(
    ticketsRepliedMetricPerChannelQueryFactory,
)

export const useClosedTicketsMetricPerChannel = createMetricPerDimensionHook(
    closedTicketsPerChannelQueryFactory,
)
export const fetchClosedTicketsMetricPerChannel = createFetchPerDimension(
    closedTicketsPerChannelQueryFactory,
)

export const useCreatedTicketsMetricPerChannel = createMetricPerDimensionHook(
    ticketsCreatedPerChannelPerChannelQueryFactory,
)
export const fetchCreatedTicketsMetricPerChannel = createFetchPerDimension(
    ticketsCreatedPerChannelPerChannelQueryFactory,
)
export const useMessagesSentMetricPerChannel = createMetricPerDimensionHook(
    messagesSentMetricPerChannelQueryFactory,
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
    )
export const fetchMedianResolutionTimeMetricPerChannel =
    createFetchPerDimension(medianResolutionTimeMetricPerChannelQueryFactory)

export const useCustomerSatisfactionMetricPerChannel =
    createMetricPerDimensionHook(
        customerSatisfactionMetricPerChannelQueryFactory,
    )
export const fetchCustomerSatisfactionMetricPerChannel =
    createFetchPerDimension(customerSatisfactionMetricPerChannelQueryFactory)

export const useOneTouchTicketsMetricPerChannel = createMetricPerDimensionHook(
    oneTouchTicketsPerChannelQueryFactory,
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
    )
export const fetchTicketAverageHandleTimePerChannel = createFetchPerDimension(
    ticketAverageHandleTimePerAgentPerChannelQueryFactory,
)

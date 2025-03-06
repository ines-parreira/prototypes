import {
    fetchMetricPerDimension,
    MetricWithDecileFetch,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { Cubes } from 'models/reporting/cubes'
import { onlineTimePerAgentQueryFactory } from 'models/reporting/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimePerAgentQueryFactory } from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { medianFirstResponseTimeMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import { messagesReceivedMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { ticketsRepliedMetricPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerAgentQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

type QueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => ReportingQuery<TCube>

export const createFetchPerDimension =
    <TCube extends Cubes>(query: QueryFactory<TCube>): MetricWithDecileFetch =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        dimensionId?: string,
    ) =>
        fetchMetricPerDimension(
            query(statsFilters, timezone, sorting),
            dimensionId,
        )

export const createMetricPerDimensionHook =
    <TCube extends Cubes>(query: QueryFactory<TCube>) =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        dimensionId?: string,
    ) =>
        useMetricPerDimension(
            query(statsFilters, timezone, sorting),
            dimensionId,
        )

export const useMedianFirstResponseTimeMetricPerAgent =
    createMetricPerDimensionHook(
        medianFirstResponseTimeMetricPerAgentQueryFactory,
    )

export const fetchMedianFirstResponseTimeMetricPerAgent =
    createFetchPerDimension(medianFirstResponseTimeMetricPerAgentQueryFactory)

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

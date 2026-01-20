import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'domains/reporting/hooks/helpers'
import type {
    MetricWithDecile,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/types'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { ticketAverageHandleTimePerAgentPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstAgentResponseTimePerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedPerChannelPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { customerSatisfactionPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/customerSatisfaction'
import { medianFirstResponseTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesReceivedPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { medianResolutionTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { medianResponseTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/responseTime'
import { ticketAverageHandleTimePerAgentPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedCountPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import { zeroTouchTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export type MetricPerChannelQueryHook<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
> = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string,
) => MetricWithDecile<TValue>

export const useMedianFirstResponseTimeMetricPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    dimensionId?: string,
) => {
    return useMetricPerDimensionV2(
        medianFirstAgentResponseTimePerChannelQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
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
    return fetchMetricPerDimensionV2(
        medianFirstAgentResponseTimePerChannelQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
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
    createMetricPerDimensionHook(
        medianResponseTimeMetricPerChannelQueryFactory,
        medianResponseTimePerChannelQueryV2Factory,
    )

export const fetchMedianResponseTimeMetricPerChannel = createFetchPerDimension(
    medianResponseTimeMetricPerChannelQueryFactory,
    medianResponseTimePerChannelQueryV2Factory,
)
// P2/P3
export const useHumanResponseTimeAfterAiHandoffPerChannel =
    createMetricPerDimensionHook(
        humanResponseTimeAfterAiHandoffPerChannelQueryFactory,
        humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory,
    )

export const fetchHumanResponseTimeAfterAiHandoffPerChannel =
    createFetchPerDimension(
        humanResponseTimeAfterAiHandoffPerChannelQueryFactory,
        humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory,
    )

export const useTicketsRepliedMetricPerChannel = createMetricPerDimensionHook(
    ticketsRepliedMetricPerChannelQueryFactory,
    ticketsRepliedCountPerChannelQueryV2Factory,
)
export const fetchTicketsRepliedMetricPerChannel = createFetchPerDimension(
    ticketsRepliedMetricPerChannelQueryFactory,
    ticketsRepliedCountPerChannelQueryV2Factory,
)

export const useClosedTicketsMetricPerChannel = createMetricPerDimensionHook(
    closedTicketsPerChannelQueryFactory,
    closedTicketsPerChannelQueryV2Factory,
)
export const fetchClosedTicketsMetricPerChannel = createFetchPerDimension(
    closedTicketsPerChannelQueryFactory,
    closedTicketsPerChannelQueryV2Factory,
)

export const useCreatedTicketsMetricPerChannel = createMetricPerDimensionHook(
    ticketsCreatedPerChannelPerChannelQueryFactory,
    createdTicketsPerChannelQueryV2Factory,
)

export const fetchCreatedTicketsMetricPerChannel = createFetchPerDimension(
    ticketsCreatedPerChannelPerChannelQueryFactory,
    createdTicketsPerChannelQueryV2Factory,
)
export const useMessagesSentMetricPerChannel = createMetricPerDimensionHook(
    messagesSentMetricPerChannelQueryFactory,
    sentMessagesPerChannelQueryV2Factory,
)
export const fetchMessagesSentMetricPerChannel = createFetchPerDimension(
    messagesSentMetricPerChannelQueryFactory,
    sentMessagesPerChannelQueryV2Factory,
)
export const useMessagesReceivedMetricPerChannel = createMetricPerDimensionHook(
    messagesReceivedMetricPerChannelQueryFactory,
    messagesReceivedPerChannelQueryV2Factory,
)
export const fetchMessagesReceivedMetricPerChannel = createFetchPerDimension(
    messagesReceivedMetricPerChannelQueryFactory,
    messagesReceivedPerChannelQueryV2Factory,
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
        customerSatisfactionPerChannelQueryV2Factory,
    )
export const fetchCustomerSatisfactionMetricPerChannel =
    createFetchPerDimension(
        customerSatisfactionMetricPerChannelQueryFactory,
        customerSatisfactionPerChannelQueryV2Factory,
    )

export const useOneTouchTicketsMetricPerChannel = createMetricPerDimensionHook(
    oneTouchTicketsPerChannelQueryFactory,
    oneTouchTicketsPerChannelQueryV2Factory,
)
export const fetchOneTouchTicketsMetricPerChannel = createFetchPerDimension(
    oneTouchTicketsPerChannelQueryFactory,
    oneTouchTicketsPerChannelQueryV2Factory,
)

export const useZeroTouchTicketsMetricPerChannel = createMetricPerDimensionHook(
    zeroTouchTicketsPerChannelQueryFactory,
    zeroTouchTicketsPerChannelQueryV2Factory,
)
export const fetchZeroTouchTicketsMetricPerChannel = createFetchPerDimension(
    zeroTouchTicketsPerChannelQueryFactory,
    zeroTouchTicketsPerChannelQueryV2Factory,
)

export const useTicketAverageHandleTimePerChannel =
    createMetricPerDimensionHook(
        ticketAverageHandleTimePerAgentPerChannelQueryFactory,
        ticketAverageHandleTimePerAgentPerChannelQueryV2Factory,
    )
export const fetchTicketAverageHandleTimePerChannel = createFetchPerDimension(
    ticketAverageHandleTimePerAgentPerChannelQueryFactory,
    ticketAverageHandleTimePerAgentPerChannelQueryV2Factory,
)

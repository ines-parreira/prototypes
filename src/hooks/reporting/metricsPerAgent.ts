import {
    MetricWithBreakdown,
    MetricWithDecile,
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {onlineTimePerAgentQueryFactory} from 'models/reporting/queryFactories/agentxp/onlineTime'
import {ticketAverageHandleTimePerAgentQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {closedTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesSentMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {ticketsRepliedMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {customFieldsTicketCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {StatsFilters} from 'models/stat/types'

export const useMedianFirstResponseTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        medianFirstResponseTimeMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const useTicketsRepliedMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        ticketsRepliedMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const useClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        closedTicketsPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const useMessagesSentMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        messagesSentMetricPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const useMedianResolutionTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        medianResolutionTimeMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const useCustomerSatisfactionMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        customerSatisfactionMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const useCustomFieldsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection
): MetricWithDecile =>
    useMetricPerDimension(
        customFieldsTicketCountQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            sorting
        )
    )

export const useCustomTicketFieldWithBreakdown = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection
): MetricWithBreakdown =>
    useMetricPerDimensionWithBreakdown(
        customFieldsTicketCountQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            sorting
        )
    )

export const useOneTouchTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        oneTouchTicketsPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const useOnlineTimePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        onlineTimePerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const useTicketAverageHandleTimePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        ticketAverageHandleTimePerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

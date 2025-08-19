import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { onlineTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'domains/reporting/models/types'
import { withFilter } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export type Metric = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
    }
}

export const ignoreNotAssignedTicketsFilter: ReportingFilter = {
    member: TicketMember.AssigneeUserId,
    operator: ReportingFilterOperator.Set,
    values: [],
}

export const ignoreNotAssignedFirstResponseMessageAssigneeFilter: ReportingFilter =
    {
        member: TicketMessagesMember.FirstHelpdeskMessageUserId,
        operator: ReportingFilterOperator.Set,
        values: [],
    }

export const useTicketsCreatedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => useMetric(ticketsCreatedQueryFactory(statsFilters, timezone))

export const fetchTicketsCreatedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(ticketsCreatedQueryFactory(statsFilters, timezone))

export const useClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            closedTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            closedTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            customerSatisfactionQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            customerSatisfactionQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useMedianFirstResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedFirstResponseMessageAssigneeFilter,
        ),
    )

export const fetchMedianFirstResponseTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useMedianResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            medianResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchMedianResponseTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            medianResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useHumanResponseTimeAfterAiHandoffMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            humanResponseTimeAfterAiHandoffQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchHumanResponseTimeAfterAiHandoffMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            humanResponseTimeAfterAiHandoffQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useMedianResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            medianResolutionTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchMedianResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            medianResolutionTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => useMetric(ticketsRepliedQueryFactory(statsFilters, timezone))

export const fetchTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(ticketsRepliedQueryFactory(statsFilters, timezone))

export const useMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => useMetric(messagesSentQueryFactory(statsFilters, timezone))

export const fetchMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(messagesSentQueryFactory(statsFilters, timezone))

export const useMessagesReceivedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => useMetric(messagesReceivedQueryFactory(statsFilters, timezone))

export const fetchMessagesReceivedMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(messagesReceivedQueryFactory(statsFilters, timezone))

export const useOneTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            oneTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchOneTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            oneTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useZeroTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric =>
    useMetric(
        withFilter(
            zeroTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchZeroTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            zeroTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useTicketAverageHandleTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Metric =>
    useMetric(
        withFilter(
            ticketAverageHandleTimeQueryFactory(
                statsFilters,
                timezone,
                sorting,
            ),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const fetchTicketAverageHandleTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            ticketAverageHandleTimeQueryFactory(
                statsFilters,
                timezone,
                sorting,
            ),
            ignoreNotAssignedTicketsFilter,
        ),
    )

export const useOnlineTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Metric => useMetric(onlineTimeQueryFactory(statsFilters, timezone, sorting))

export const fetchOnlineTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Promise<Metric> =>
    fetchMetric(onlineTimeQueryFactory(statsFilters, timezone, sorting))

import {fetchMetric, useMetric} from 'hooks/reporting/useMetric'
import {OrderDirection} from 'models/api/types'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {onlineTimeQueryFactory} from 'models/reporting/queryFactories/agentxp/onlineTime'
import {ticketAverageHandleTimeQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {zeroTouchTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import {ReportingFilter, ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {withFilter} from 'utils/reporting'

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

export const useTicketsCreatedMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(ticketsCreatedQueryFactory(statsFilters, timezone))

export const fetchTicketsCreatedMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(ticketsCreatedQueryFactory(statsFilters, timezone))

export const useClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            closedTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            closedTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            customerSatisfactionQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            customerSatisfactionQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useMedianFirstResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchMedianFirstResponseTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            medianFirstResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useMedianResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            medianResolutionTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchMedianResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            medianResolutionTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(ticketsRepliedQueryFactory(statsFilters, timezone))

export const fetchTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(ticketsRepliedQueryFactory(statsFilters, timezone))

export const useMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(messagesSentQueryFactory(statsFilters, timezone))

export const fetchMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(messagesSentQueryFactory(statsFilters, timezone))

export const useOneTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            oneTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchOneTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            oneTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useZeroTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            zeroTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchZeroTouchTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            zeroTouchTicketsQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useTicketAverageHandleTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): Metric =>
    useMetric(
        withFilter(
            ticketAverageHandleTimeQueryFactory(
                statsFilters,
                timezone,
                sorting
            ),
            ignoreNotAssignedTicketsFilter
        )
    )

export const fetchTicketAverageHandleTimeMetric = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): Promise<Metric> =>
    fetchMetric(
        withFilter(
            ticketAverageHandleTimeQueryFactory(
                statsFilters,
                timezone,
                sorting
            ),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useOnlineTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): Metric => useMetric(onlineTimeQueryFactory(statsFilters, timezone, sorting))

export const fetchOnlineTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): Promise<Metric> =>
    fetchMetric(onlineTimeQueryFactory(statsFilters, timezone, sorting))

import {useMetric} from 'hooks/reporting/useMetric'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {firstResponseTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/firstResponseTime'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {resolutionTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/resolutionTime'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
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

export const useFirstResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            firstResponseTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            resolutionTimeQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            ticketsRepliedQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

export const useMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric =>
    useMetric(
        withFilter(
            messagesSentQueryFactory(statsFilters, timezone),
            ignoreNotAssignedTicketsFilter
        )
    )

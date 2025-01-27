import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {StatsFilters} from 'models/stat/types'

export const useBreachedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string
): MetricTrend => {
    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )
}
export const fetchBreachedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string
): Promise<MetricTrend> =>
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )

export const useSatisfiedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string
): MetricTrend => {
    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
}

export const fetchSatisfiedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string
): Promise<MetricTrend> =>
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )

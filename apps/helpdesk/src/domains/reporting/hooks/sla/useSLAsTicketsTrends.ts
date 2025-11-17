import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useBreachedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
): MetricTrend => {
    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached,
    )
}
export const fetchBreachedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
): Promise<MetricTrend> =>
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached,
    )

export const useSatisfiedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
): MetricTrend => {
    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied,
    )
}

export const fetchSatisfiedSlaTicketsTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
): Promise<MetricTrend> =>
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied,
    )

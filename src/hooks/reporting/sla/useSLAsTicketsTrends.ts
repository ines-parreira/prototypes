import {useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'

export const useBreachedSlaTicketsTrend = (): MetricTrend => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )
}

export const useSatisfiedSlaTicketsTrend = (): MetricTrend => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
}

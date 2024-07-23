import {useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import useAppSelector from 'hooks/useAppSelector'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const useBreachedSlaTicketsTrend = (): MetricTrend => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )
}

export const useSatisfiedSlaTicketsTrend = (): MetricTrend => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
}

import {Metric} from 'hooks/reporting/metrics'
import {
    useTicketsInPolicyPerStatus,
    useTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useTicketsInPolicy'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import useAppSelector from 'hooks/useAppSelector'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {calculatePercentage} from 'utils/reporting'

export const useTicketSlaAchievementRate = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const satisfiedSlaTickets = useTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
    const breachedSlaTickets = useTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )

    const slaAchievementRate =
        satisfiedSlaTickets.data?.value && breachedSlaTickets.data?.value
            ? calculatePercentage(
                  satisfiedSlaTickets.data?.value,
                  satisfiedSlaTickets.data?.value +
                      breachedSlaTickets.data?.value
              )
            : null

    return {
        isFetching:
            satisfiedSlaTickets.isFetching || breachedSlaTickets.isFetching,
        isError: satisfiedSlaTickets.isError || breachedSlaTickets.isError,
        data: {
            value: slaAchievementRate,
        },
    }
}

export const useTicketSlaAchievementRateTrend = (): MetricTrend => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const satisfiedSlaTicketsTrend = useTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
    const breachedSlaTicketsTrend = useTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )

    const slaAchievementRate =
        satisfiedSlaTicketsTrend.data?.value &&
        breachedSlaTicketsTrend.data?.value
            ? calculatePercentage(
                  satisfiedSlaTicketsTrend.data?.value,
                  satisfiedSlaTicketsTrend.data?.value +
                      breachedSlaTicketsTrend.data?.value
              )
            : null

    const slaAchievementRatePreviousPeriod =
        satisfiedSlaTicketsTrend.data?.prevValue &&
        breachedSlaTicketsTrend.data?.prevValue
            ? calculatePercentage(
                  satisfiedSlaTicketsTrend.data?.prevValue,
                  satisfiedSlaTicketsTrend.data?.prevValue +
                      breachedSlaTicketsTrend.data?.prevValue
              )
            : null

    return {
        isFetching:
            satisfiedSlaTicketsTrend.isFetching ||
            breachedSlaTicketsTrend.isFetching,
        isError:
            satisfiedSlaTicketsTrend.isError || breachedSlaTicketsTrend.isError,
        data: {
            value: slaAchievementRate,
            prevValue: slaAchievementRatePreviousPeriod,
        },
    }
}

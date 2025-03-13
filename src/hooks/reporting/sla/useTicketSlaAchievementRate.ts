import { Metric } from 'hooks/reporting/metrics'
import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { TicketSLAStatus } from 'models/reporting/cubes/sla/TicketSLACube'
import { StatsFilters } from 'models/stat/types'
import { calculatePercentage } from 'utils/reporting'

const getSlaAchievementRate = (
    satisfiedSlaTickets: number | null | undefined,
    breachedSlaTickets: number | null | undefined,
) =>
    calculatePercentage(
        satisfiedSlaTickets ?? 0,
        (satisfiedSlaTickets ?? 0) + (breachedSlaTickets ?? 0),
    )

export const useTicketSlaAchievementRate = (): Metric => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const satisfiedSlaTickets = useSatisfiedOrBreachedTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied,
    )
    const breachedSlaTickets = useSatisfiedOrBreachedTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached,
    )

    const slaAchievementRate = getSlaAchievementRate(
        satisfiedSlaTickets.data?.value,
        breachedSlaTickets.data?.value,
    )

    return {
        isFetching:
            satisfiedSlaTickets.isFetching || breachedSlaTickets.isFetching,
        isError: satisfiedSlaTickets.isError || breachedSlaTickets.isError,
        data: {
            value: slaAchievementRate,
        },
    }
}

export const useTicketSlaAchievementRateTrend = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
): MetricTrend => {
    const satisfiedSlaTicketsTrend =
        useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
            cleanStatsFilters,
            userTimezone,
            undefined,
            TicketSLAStatus.Satisfied,
        )
    const breachedSlaTicketsTrend =
        useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
            cleanStatsFilters,
            userTimezone,
            undefined,
            TicketSLAStatus.Breached,
        )

    const slaAchievementRate = getSlaAchievementRate(
        satisfiedSlaTicketsTrend.data?.value,
        breachedSlaTicketsTrend.data?.value,
    )

    const slaAchievementRatePreviousPeriod = getSlaAchievementRate(
        satisfiedSlaTicketsTrend.data?.prevValue,
        breachedSlaTicketsTrend.data?.prevValue,
    )

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

export const fetchTicketSlaAchievementRateTrend = async (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
): Promise<MetricTrend> => {
    const satisfiedSlaTicketsTrend =
        await fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
            cleanStatsFilters,
            userTimezone,
            undefined,
            TicketSLAStatus.Satisfied,
        )
    const breachedSlaTicketsTrend =
        await fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
            cleanStatsFilters,
            userTimezone,
            undefined,
            TicketSLAStatus.Breached,
        )

    const slaAchievementRate = getSlaAchievementRate(
        satisfiedSlaTicketsTrend.data?.value,
        breachedSlaTicketsTrend.data?.value,
    )

    const slaAchievementRatePreviousPeriod = getSlaAchievementRate(
        satisfiedSlaTicketsTrend.data?.prevValue,
        breachedSlaTicketsTrend.data?.prevValue,
    )

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

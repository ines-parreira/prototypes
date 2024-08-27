import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {Metric} from 'hooks/reporting/metrics'
import {
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import useAppSelector from 'hooks/useAppSelector'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {calculatePercentage} from 'utils/reporting'

const getSlaAchievementRate = (
    satisfiedSlaTickets: number | null | undefined,
    breachedSlaTickets: number | null | undefined
) =>
    calculatePercentage(
        satisfiedSlaTickets ?? 0,
        (satisfiedSlaTickets ?? 0) + (breachedSlaTickets ?? 0)
    )

export const useTicketSlaAchievementRate = (): Metric => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const satisfiedSlaTickets = useSatisfiedOrBreachedTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
    const breachedSlaTickets = useSatisfiedOrBreachedTicketsInPolicyPerStatus(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )

    const slaAchievementRate = getSlaAchievementRate(
        satisfiedSlaTickets.data?.value,
        breachedSlaTickets.data?.value
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

export const useTicketSlaAchievementRateTrend = (): MetricTrend => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const satisfiedSlaTicketsTrend =
        useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
            cleanStatsFilters,
            userTimezone,
            undefined,
            TicketSLAStatus.Satisfied
        )
    const breachedSlaTicketsTrend =
        useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
            cleanStatsFilters,
            userTimezone,
            undefined,
            TicketSLAStatus.Breached
        )

    const slaAchievementRate = getSlaAchievementRate(
        satisfiedSlaTicketsTrend.data?.value,
        breachedSlaTicketsTrend.data?.value
    )

    const slaAchievementRatePreviousPeriod = getSlaAchievementRate(
        satisfiedSlaTicketsTrend.data?.prevValue,
        breachedSlaTicketsTrend.data?.prevValue
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

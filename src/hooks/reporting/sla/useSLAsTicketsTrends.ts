import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import useAppSelector from 'hooks/useAppSelector'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

export const useBreachedSlaTicketsTrend = (): MetricTrend => {
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

    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Breached
    )
}

export const useSatisfiedSlaTicketsTrend = (): MetricTrend => {
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

    return useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
        cleanStatsFilters,
        userTimezone,
        undefined,
        TicketSLAStatus.Satisfied
    )
}

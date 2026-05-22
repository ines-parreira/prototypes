import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useOverallAutomatedInteractionsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
    enabled: boolean = true,
) =>
    useStatsMetricTrend(
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        enabled,
    )

export const fetchOverallAutomatedInteractionsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) =>
    fetchStatsMetricTrend(
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
    )

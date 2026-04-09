import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useOverallAutomatedInteractionsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
    enabled: boolean = true,
) => {
    const stage = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
        !isV2 && enabled,
    )
    const v2Trend = useStatsMetricTrend(
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
        isV2 && enabled,
    )

    return isV2 ? v2Trend : v1Trend
}

export const fetchOverallAutomatedInteractionsTrend = async (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    return isV2
        ? await fetchStatsMetricTrend(
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
        : await fetchFilteredAutomatedInteractions(statsFilters, userTimezone)
}

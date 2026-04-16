import {
    fetchTimeSavedByAgentsTrend,
    useTimeSavedByAgentsTrend,
} from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAverageTimeSavedByAgentQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useOverallTimeSavedByAgentsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const stage = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_AVERAGE_TIME_SAVED_BY_AGENT,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useTimeSavedByAgentsTrend(statsFilters, userTimezone, !isV2)
    const v2Trend = useStatsMetricTrend(
        dynamicAverageTimeSavedByAgentQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicAverageTimeSavedByAgentQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        isV2,
    )

    return isV2 ? v2Trend : v1Trend
}

export const fetchOverallTimeSavedByAgentsTrend = async (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_AVERAGE_TIME_SAVED_BY_AGENT,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    return isV2
        ? await fetchStatsMetricTrend(
              dynamicAverageTimeSavedByAgentQueryFactoryV2({
                  filters: statsFilters,
                  timezone: userTimezone,
              }),
              dynamicAverageTimeSavedByAgentQueryFactoryV2({
                  filters: {
                      ...statsFilters,
                      period: getPreviousPeriod(statsFilters.period),
                  },
                  timezone: userTimezone,
              }),
          )
        : await fetchTimeSavedByAgentsTrend(statsFilters, userTimezone)
}

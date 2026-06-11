import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicMedianTimeSavedByAgentQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useOverallTimeSavedByAgentsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) =>
    useStatsMetricTrend(
        dynamicMedianTimeSavedByAgentQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicMedianTimeSavedByAgentQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
    )

export const fetchOverallTimeSavedByAgentsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) =>
    fetchStatsMetricTrend(
        dynamicMedianTimeSavedByAgentQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicMedianTimeSavedByAgentQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
    )

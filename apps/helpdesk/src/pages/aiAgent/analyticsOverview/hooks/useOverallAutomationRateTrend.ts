import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useOverallAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        dynamicOverallAutomationRateQueryFactoryV2({ filters, timezone }),
        dynamicOverallAutomationRateQueryFactoryV2({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchOverallAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        dynamicOverallAutomationRateQueryFactoryV2({ filters, timezone }),
        dynamicOverallAutomationRateQueryFactoryV2({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

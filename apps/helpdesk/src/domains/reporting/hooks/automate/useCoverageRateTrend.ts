import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { coverageRateQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useCoverageRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useStatsMetricTrend(
        coverageRateQueryV2Factory({ filters, timezone }),
        coverageRateQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
}

export const fetchCoverageRateTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchStatsMetricTrend(
        coverageRateQueryV2Factory({ filters, timezone }),
        coverageRateQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
}

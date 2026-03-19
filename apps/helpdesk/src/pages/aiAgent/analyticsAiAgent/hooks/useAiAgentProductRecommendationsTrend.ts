import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { recommendedProductCountQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentProductRecommendationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        recommendedProductCountQueryV2Factory({ filters, timezone }),
        recommendedProductCountQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentProductRecommendationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        recommendedProductCountQueryV2Factory({ filters, timezone }),
        recommendedProductCountQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

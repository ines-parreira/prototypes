import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { gmvUSDInfluencedQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { totalSalesAmountUsdQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentTotalSalesTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        gmvUSDInfluencedQueryFactory(filters, timezone),
        gmvUSDInfluencedQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        totalSalesAmountUsdQueryV2Factory({ filters, timezone }),
        totalSalesAmountUsdQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentTotalSalesTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        gmvUSDInfluencedQueryFactory(filters, timezone),
        gmvUSDInfluencedQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        totalSalesAmountUsdQueryV2Factory({ filters, timezone }),
        totalSalesAmountUsdQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

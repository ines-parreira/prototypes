import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { discountUsageQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentDiscounts'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentDiscountUsageTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        discountUsageQueryV2Factory({ filters, timezone }),
        discountUsageQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentDiscountUsageTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        discountUsageQueryV2Factory({ filters, timezone }),
        discountUsageQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

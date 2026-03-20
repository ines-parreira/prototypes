import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageDiscountAmountQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentDiscounts'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAverageDiscountAmountTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        averageDiscountAmountQueryV2Factory({ filters, timezone }),
        averageDiscountAmountQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentAverageDiscountAmountTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        averageDiscountAmountQueryV2Factory({ filters, timezone }),
        averageDiscountAmountQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

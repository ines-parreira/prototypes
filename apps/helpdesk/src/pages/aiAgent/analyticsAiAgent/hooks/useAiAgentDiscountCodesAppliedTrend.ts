import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { appliedDiscountCodesQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentDiscounts'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentDiscountCodesAppliedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        appliedDiscountCodesQueryV2Factory({ filters, timezone }),
        appliedDiscountCodesQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentDiscountCodesAppliedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        appliedDiscountCodesQueryV2Factory({ filters, timezone }),
        appliedDiscountCodesQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

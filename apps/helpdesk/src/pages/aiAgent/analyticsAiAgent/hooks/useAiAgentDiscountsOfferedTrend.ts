import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { discountCodesOfferedQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentDiscounts'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentDiscountsOfferedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        discountCodesOfferedQueryV2Factory({ filters, timezone }),
        discountCodesOfferedQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentDiscountsOfferedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        discountCodesOfferedQueryV2Factory({ filters, timezone }),
        discountCodesOfferedQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { conversionRateQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiSalesAgentConversionRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        conversionRateQueryV2Factory({ filters, timezone }),
        conversionRateQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiSalesAgentConversionRateTrend = async (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        conversionRateQueryV2Factory({ filters, timezone }),
        conversionRateQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

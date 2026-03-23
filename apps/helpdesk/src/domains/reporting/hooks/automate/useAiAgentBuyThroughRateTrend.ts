import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { buyThroughRateQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentBuyThroughRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentBuyThroughRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useStatsMetricTrend(
        buyThroughRateQueryV2Factory({ filters, timezone }),
        buyThroughRateQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
}

export const fetchAiAgentBuyThroughRateTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchStatsMetricTrend(
        buyThroughRateQueryV2Factory({ filters, timezone }),
        buyThroughRateQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
}

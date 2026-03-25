import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { medianPurchaseTimeQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentMedianPurchaseTimeTrend = getStatsTrendHook(
    medianPurchaseTimeQueryV2Factory,
)

export const fetchAiAgentMedianPurchaseTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        medianPurchaseTimeQueryV2Factory({ filters, timezone }),
        medianPurchaseTimeQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

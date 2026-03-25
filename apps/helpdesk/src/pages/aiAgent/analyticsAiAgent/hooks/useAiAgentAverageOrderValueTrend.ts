import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageOrderValueQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAverageOrderValueTrend = getStatsTrendHook(
    averageOrderValueQueryV2Factory,
)

export const fetchAiAgentAverageOrderValueTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        averageOrderValueQueryV2Factory({ filters, timezone }),
        averageOrderValueQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

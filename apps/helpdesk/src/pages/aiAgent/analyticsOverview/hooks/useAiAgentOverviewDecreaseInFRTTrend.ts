import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageDecreaseInFirstResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentOverviewDecreaseInFRTTrend = getStatsTrendHook(
    averageDecreaseInFirstResponseTimeQueryV2Factory,
)

export const fetchAiAgentOverviewDecreaseInFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        averageDecreaseInFirstResponseTimeQueryV2Factory({
            filters,
            timezone,
        }),
        averageDecreaseInFirstResponseTimeQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

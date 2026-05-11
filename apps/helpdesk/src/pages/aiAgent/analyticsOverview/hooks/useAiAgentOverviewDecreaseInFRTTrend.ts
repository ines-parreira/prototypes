import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { medianDecreaseInFirstResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentOverviewDecreaseInFRTTrend = getStatsTrendHook(
    medianDecreaseInFirstResponseTimeQueryV2Factory,
)

export const fetchAiAgentOverviewDecreaseInFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        medianDecreaseInFirstResponseTimeQueryV2Factory({
            filters,
            timezone,
        }),
        medianDecreaseInFirstResponseTimeQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

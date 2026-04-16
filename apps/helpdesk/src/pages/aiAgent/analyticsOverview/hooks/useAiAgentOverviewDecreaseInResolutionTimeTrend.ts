import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { overallDecreaseInResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/overallDecreaseInResolutionTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentOverviewDecreaseInResolutionTimeTrend =
    getStatsTrendHook(overallDecreaseInResolutionTimeQueryV2Factory)

export const fetchAiAgentOverviewDecreaseInResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        overallDecreaseInResolutionTimeQueryV2Factory({
            filters,
            timezone,
        }),
        overallDecreaseInResolutionTimeQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

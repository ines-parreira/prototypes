import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentSupportAgentDecreaseInResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentSupportAgentDecreaseInResolutionTimeTrend =
    getStatsTrendHook(aiAgentSupportAgentDecreaseInResolutionTimeQueryV2Factory)

export const fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiAgentSupportAgentDecreaseInResolutionTimeQueryV2Factory({
            filters,
            timezone,
        }),
        aiAgentSupportAgentDecreaseInResolutionTimeQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

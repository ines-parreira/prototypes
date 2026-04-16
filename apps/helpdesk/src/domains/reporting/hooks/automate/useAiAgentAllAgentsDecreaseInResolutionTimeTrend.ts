import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsDecreaseInResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAllAgentsDecreaseInResolutionTimeTrend =
    getStatsTrendHook(aiAgentAllAgentsDecreaseInResolutionTimeQueryV2Factory)

export const fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiAgentAllAgentsDecreaseInResolutionTimeQueryV2Factory({
            filters,
            timezone,
        }),
        aiAgentAllAgentsDecreaseInResolutionTimeQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

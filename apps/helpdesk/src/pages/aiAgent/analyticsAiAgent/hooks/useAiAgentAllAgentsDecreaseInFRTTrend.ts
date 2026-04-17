import {
    fetchStatsMetricTrend,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsDecreaseInFRTQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAllAgentsDecreaseInFRTTrend = getStatsTrendHook(
    aiAgentAllAgentsDecreaseInFRTQueryV2Factory,
)

export const fetchAiAgentAllAgentsDecreaseInFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiAgentAllAgentsDecreaseInFRTQueryV2Factory({ filters, timezone }),
        aiAgentAllAgentsDecreaseInFRTQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

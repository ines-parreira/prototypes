import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentSupportAgentDecreaseInFRTQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

export const useAiAgentSupportAgentFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const agentFilters = applyAiAgentFilter(filters, aiAgentUserId)

    return useStatsMetricTrend(
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
            filters: agentFilters,
            timezone,
        }),
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
            filters: {
                ...agentFilters,
                period: getPreviousPeriod(agentFilters.period),
            },
            timezone,
        }),
    )
}

export const fetchAiAgentSupportAgentFRTTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const agentFilters = applyAiAgentFilter(filters, aiAgentUserId)

    return fetchStatsMetricTrend(
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
            filters: agentFilters,
            timezone,
        }),
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
            filters: {
                ...agentFilters,
                period: getPreviousPeriod(agentFilters.period),
            },
            timezone,
        }),
    )
}

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

const resolutionTimeTrendHook = getStatsTrendHook(
    aiAgentAllAgentsResolutionTimeQueryV2Factory,
)
const resolutionTimeTrendFetch = getStatsTrendFetch(
    aiAgentAllAgentsResolutionTimeQueryV2Factory,
)

export const useAiAgentAllAgentsResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    return resolutionTimeTrendHook(
        applyAiAgentFilter(filters, aiAgentUserId),
        timezone,
    )
}

export const fetchAiAgentAllAgentsResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) =>
    resolutionTimeTrendFetch(
        applyAiAgentFilter(filters, aiAgentUserId),
        timezone,
    )

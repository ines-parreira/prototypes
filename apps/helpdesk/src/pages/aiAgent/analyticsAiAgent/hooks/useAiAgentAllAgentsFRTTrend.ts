import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    getStatsTrendFetch,
    getStatsTrendHook,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsFRTQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

const frtTrendHook = getStatsTrendHook(aiAgentAllAgentsFRTQueryV2Factory)
const frtTrendFetch = getStatsTrendFetch(aiAgentAllAgentsFRTQueryV2Factory)

export const useAiAgentAllAgentsFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    return frtTrendHook(applyAiAgentFilter(filters, aiAgentUserId), timezone)
}

export const fetchAiAgentAllAgentsFRTTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => frtTrendFetch(applyAiAgentFilter(filters, aiAgentUserId), timezone)

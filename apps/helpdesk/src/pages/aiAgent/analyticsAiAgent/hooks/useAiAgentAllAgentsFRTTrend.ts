import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchDecreaseInFirstResponseTimeTrend,
    useDecreaseInFirstResponseTimeTrend,
} from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

export const useAiAgentAllAgentsFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return useDecreaseInFirstResponseTimeTrend(filteredFilters, timezone)
}

export const fetchAiAgentAllAgentsFRTTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return fetchDecreaseInFirstResponseTimeTrend(
        filteredFilters,
        timezone,
        aiAgentUserId,
    )
}

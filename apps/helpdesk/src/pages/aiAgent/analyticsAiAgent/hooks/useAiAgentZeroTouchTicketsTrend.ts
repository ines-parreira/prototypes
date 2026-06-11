import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsZeroTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

export const useAiAgentZeroTouchTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const agentFilters = applyAiAgentFilter(filters, aiAgentUserId)

    return useStatsMetricTrend(
        aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
            filters: agentFilters,
            timezone,
        }),
        aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
            filters: {
                ...agentFilters,
                period: getPreviousPeriod(agentFilters.period),
            },
            timezone,
        }),
    )
}

export const fetchAiAgentZeroTouchTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const agentFilters = applyAiAgentFilter(filters, aiAgentUserId)

    return fetchStatsMetricTrend(
        aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
            filters: agentFilters,
            timezone,
        }),
        aiAgentAllAgentsZeroTouchTicketsQueryV2Factory({
            filters: {
                ...agentFilters,
                period: getPreviousPeriod(agentFilters.period),
            },
            timezone,
        }),
    )
}

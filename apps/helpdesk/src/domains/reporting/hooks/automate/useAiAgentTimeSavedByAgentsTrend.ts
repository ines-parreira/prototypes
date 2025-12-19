import {
    fetchAIAgentAutomatedInteractionsTrend,
    useAIAgentAutomatedInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { calculateTimeSavedByAgents } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'domains/reporting/hooks/metricTrends'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentTimeSavedByAgentsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const aiAiAgentAutomatedInteractionTrend =
        useAIAgentAutomatedInteractionsTrend(statsFilters, userTimezone)
    const ticketHandleTimeTrend = useTicketHandleTimeTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching:
            ticketHandleTimeTrend.isFetching ||
            aiAiAgentAutomatedInteractionTrend.isFetching,
        isError:
            ticketHandleTimeTrend.isError ||
            aiAiAgentAutomatedInteractionTrend.isError,
        data: calculateTimeSavedByAgents(
            ticketHandleTimeTrend,
            aiAiAgentAutomatedInteractionTrend,
        ),
    }
}

export const fetchAiAgentTimeSavedByAgentsTrend = async (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    return Promise.all([
        fetchAIAgentAutomatedInteractionsTrend(statsFilters, userTimezone),
        fetchTicketHandleTimeTrend(statsFilters, userTimezone),
    ]).then(([ticketHandleTimeTrend, aiAgentAutomatedInteractionTrend]) => ({
        data: calculateTimeSavedByAgents(
            ticketHandleTimeTrend,
            aiAgentAutomatedInteractionTrend,
        ),
        isFetching: false,
        isError: false,
    }))
}

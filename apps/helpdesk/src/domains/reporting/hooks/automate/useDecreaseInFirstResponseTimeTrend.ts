import { getDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchFirstResponseTimeExcludingAIAgent,
    fetchFirstResponseTimeIncludingAIAgent,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useFirstResponseTimeExcludingAIAgent,
    useFirstResponseTimeIncludingAIAgent,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useDecreaseInFirstResponseTimeTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredAutomatedInteractions = useFilteredAutomatedInteractions(
        filters,
        timezone,
    )

    const billableTicketsExcludingAIAgent = useBillableTicketsExcludingAIAgent(
        filters,
        timezone,
        aiAgentUserId,
    )
    const firstResponseTimeExcludingAIAgent =
        useFirstResponseTimeExcludingAIAgent(filters, timezone, aiAgentUserId)

    const firstResponseTimeIncludingAIAgent =
        useFirstResponseTimeIncludingAIAgent(filters, timezone)

    const isFetching =
        filteredAutomatedInteractions.isFetching ||
        billableTicketsExcludingAIAgent.isFetching ||
        firstResponseTimeExcludingAIAgent.isFetching ||
        firstResponseTimeIncludingAIAgent.isFetching

    const isError =
        filteredAutomatedInteractions.isError ||
        billableTicketsExcludingAIAgent.isError ||
        firstResponseTimeExcludingAIAgent.isError ||
        firstResponseTimeIncludingAIAgent.isError

    return getDecreaseInFirstResponseTimeTrend(
        isFetching,
        isError,
        filteredAutomatedInteractions.data,
        billableTicketsExcludingAIAgent.data,
        firstResponseTimeExcludingAIAgent.data,
        firstResponseTimeIncludingAIAgent.data,
    )
}

export const fetchDecreaseInFirstResponseTimeTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    return Promise.all([
        fetchFilteredAutomatedInteractions(filters, timezone),

        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
        fetchFirstResponseTimeExcludingAIAgent(
            filters,
            timezone,
            aiAgentUserId,
        ),

        fetchFirstResponseTimeIncludingAIAgent(filters, timezone),
    ]).then(
        ([
            filteredAutomatedInteractions,
            billableTicketsExcludingAIAgent,
            firstResponseTimeExcludingAIAgent,
            firstResponseTimeIncludingAIAgent,
        ]) =>
            getDecreaseInFirstResponseTimeTrend(
                false,
                false,
                filteredAutomatedInteractions.data,
                billableTicketsExcludingAIAgent.data,
                firstResponseTimeExcludingAIAgent.data,
                firstResponseTimeIncludingAIAgent.data,
            ),
    )
}

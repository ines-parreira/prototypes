import { getAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredAutomatedInteractions = useFilteredAutomatedInteractions(
        filters,
        timezone,
    )

    const allAutomatedInteractionsByAutoResponders =
        useAllAutomatedInteractionsByAutoResponders(filters, timezone)

    const allAutomatedInteractions = useAllAutomatedInteractions(
        filters,
        timezone,
    )
    const billableTicketsExcludingAIAgent = useBillableTicketsExcludingAIAgent(
        filters,
        timezone,
        aiAgentUserId,
    )

    const isFetching =
        filteredAutomatedInteractions.isFetching ||
        allAutomatedInteractions.isFetching ||
        billableTicketsExcludingAIAgent.isFetching

    const isError =
        filteredAutomatedInteractions.isError ||
        allAutomatedInteractions.isError ||
        billableTicketsExcludingAIAgent.isError

    return getAutomationRateUnfilteredDenominatorTrend({
        isFetching,
        isError,
        filteredAutomatedInteractions: filteredAutomatedInteractions.data,
        allAutomatedInteractions: allAutomatedInteractions.data,
        allAutomatedInteractionsByAutoResponders:
            allAutomatedInteractionsByAutoResponders.data,
        billableTicketsCount: billableTicketsExcludingAIAgent.data,
    })
}

export const fetchAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    return Promise.all([
        fetchFilteredAutomatedInteractions(filters, timezone),
        fetchAllAutomatedInteractionsByAutoResponders(filters, timezone),
        fetchAllAutomatedInteractions(filters, timezone),
        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
    ]).then(
        ([
            filteredAutomatedInteractions,
            allAutomatedInteractionsByAutoResponders,
            allAutomatedInteractions,
            billableTicketsExcludingAIAgent,
        ]) => {
            return getAutomationRateUnfilteredDenominatorTrend({
                isFetching: false,
                isError: false,
                filteredAutomatedInteractions:
                    filteredAutomatedInteractions.data,
                allAutomatedInteractions: allAutomatedInteractions.data,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders.data,
                billableTicketsCount: billableTicketsExcludingAIAgent.data,
            })
        },
    )
}

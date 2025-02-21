import {getDecreaseInResolutionTimeTrend} from 'hooks/reporting/automate/automateStatsCalculatedTrends'
import {
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchResolutionTimeExcludingAIAgent,
    fetchResolutionTimeResolvedByAIAgent,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useResolutionTimeExcludingAIAgent,
    useResolutionTimeResolvedByAIAgent,
} from 'hooks/reporting/automate/automationTrends'
import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import {StatsFilters} from 'models/stat/types'

export const useDecreaseInResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredAutomatedInteractions = useFilteredAutomatedInteractions(
        filters,
        timezone
    )

    const billableTicketsExcludingAIAgent = useBillableTicketsExcludingAIAgent(
        filters,
        timezone,
        aiAgentUserId
    )

    const resolutionTimeExcludingAIAgent = useResolutionTimeExcludingAIAgent(
        filters,
        timezone,
        aiAgentUserId
    )

    const resolutionTimeResolvedByAIAgent = useResolutionTimeResolvedByAIAgent(
        filters,
        timezone
    )

    const isFetching =
        filteredAutomatedInteractions.isFetching ||
        billableTicketsExcludingAIAgent.isFetching ||
        resolutionTimeExcludingAIAgent.isFetching ||
        resolutionTimeResolvedByAIAgent.isFetching

    const isError =
        filteredAutomatedInteractions.isError ||
        billableTicketsExcludingAIAgent.isError ||
        resolutionTimeExcludingAIAgent.isError ||
        resolutionTimeResolvedByAIAgent.isError

    return getDecreaseInResolutionTimeTrend(
        isFetching,
        isError,
        filteredAutomatedInteractions.data,
        billableTicketsExcludingAIAgent.data,
        resolutionTimeExcludingAIAgent.data,
        resolutionTimeResolvedByAIAgent.data
    )
}

export const fetchDecreaseInResolutionTimeTrend = async (
    filters: StatsFilters,
    timezone: string,
    _isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    aiAgentUserId: string | undefined
) => {
    return Promise.all([
        fetchFilteredAutomatedInteractions(filters, timezone),
        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
        fetchResolutionTimeExcludingAIAgent(filters, timezone, aiAgentUserId),
        fetchResolutionTimeResolvedByAIAgent(filters, timezone),
    ]).then(
        ([
            filteredAutomatedInteractions,
            billableTicketsExcludingAIAgent,
            resolutionTimeExcludingAIAgent,
            resolutionTimeResolvedByAIAgent,
        ]) =>
            getDecreaseInResolutionTimeTrend(
                false,
                false,
                filteredAutomatedInteractions.data,
                billableTicketsExcludingAIAgent.data,
                resolutionTimeExcludingAIAgent.data,
                resolutionTimeResolvedByAIAgent.data
            )
    )
}

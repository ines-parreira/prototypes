import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    getAutomationRateTrend,
    getAutomationRateUnfilteredDenominatorTrend,
} from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchFilteredAutomatedInteractionsByAutoResponders,
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useFilteredAutomatedInteractionsByAutoResponders,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const isAutomateNonFilteredDenominatorInAutomationRate = useFlag(
        FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate,
    )
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

    const filteredAutomatedInteractionsByAutoResponders =
        useFilteredAutomatedInteractionsByAutoResponders(filters, timezone)

    const isFetching =
        filteredAutomatedInteractions.isFetching ||
        allAutomatedInteractions.isFetching ||
        billableTicketsExcludingAIAgent.isFetching

    const isError =
        filteredAutomatedInteractions.isError ||
        allAutomatedInteractions.isError ||
        billableTicketsExcludingAIAgent.isError

    return isAutomateNonFilteredDenominatorInAutomationRate
        ? getAutomationRateUnfilteredDenominatorTrend({
              isFetching,
              isError,
              filteredAutomatedInteractions: filteredAutomatedInteractions.data,
              allAutomatedInteractions: allAutomatedInteractions.data,
              allAutomatedInteractionsByAutoResponders:
                  allAutomatedInteractionsByAutoResponders.data,
              billableTicketsCount: billableTicketsExcludingAIAgent.data,
          })
        : getAutomationRateTrend(
              isFetching,
              isError,
              filteredAutomatedInteractions.data,
              billableTicketsExcludingAIAgent.data,
              filteredAutomatedInteractionsByAutoResponders.data,
          )
}

export const fetchAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    aiAgentUserId: number | undefined,
) => {
    return Promise.all([
        fetchFilteredAutomatedInteractions(filters, timezone),
        fetchAllAutomatedInteractionsByAutoResponders(filters, timezone),
        fetchAllAutomatedInteractions(filters, timezone),
        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
        fetchFilteredAutomatedInteractionsByAutoResponders(filters, timezone),
    ]).then(
        ([
            filteredAutomatedInteractions,
            allAutomatedInteractionsByAutoResponders,
            allAutomatedInteractions,
            billableTicketsExcludingAIAgent,
            filteredAutomatedInteractionsByAutoResponders,
        ]) => {
            return isAutomateNonFilteredDenominatorInAutomationRate
                ? getAutomationRateUnfilteredDenominatorTrend({
                      isFetching: false,
                      isError: false,
                      filteredAutomatedInteractions:
                          filteredAutomatedInteractions.data,
                      allAutomatedInteractions: allAutomatedInteractions.data,
                      allAutomatedInteractionsByAutoResponders:
                          allAutomatedInteractionsByAutoResponders.data,
                      billableTicketsCount:
                          billableTicketsExcludingAIAgent.data,
                  })
                : getAutomationRateTrend(
                      false,
                      false,
                      filteredAutomatedInteractions.data,
                      billableTicketsExcludingAIAgent.data,
                      filteredAutomatedInteractionsByAutoResponders.data,
                  )
        },
    )
}

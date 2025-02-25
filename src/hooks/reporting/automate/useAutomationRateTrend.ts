import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    getAutomationRateTrend,
    getAutomationRateUnfilteredDenominatorTrend,
} from 'hooks/reporting/automate/automateStatsCalculatedTrends'
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
} from 'hooks/reporting/automate/automationTrends'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { StatsFilters } from 'models/stat/types'

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined =
        useFlags()[
            FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate
        ]
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
    aiAgentUserId: string | undefined,
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

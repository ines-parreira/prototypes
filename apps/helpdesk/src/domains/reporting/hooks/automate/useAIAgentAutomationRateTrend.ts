import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    getAIAgentAutomationRateTrend,
    getAIAgentAutomationRateUnfilteredDenominatorTrend,
} from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchTrendFromMultipleMetricsTrend,
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAIAgentAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined = useFlag(
        FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate,
    )
    const aiAgentUserId = useAIAgentUserId()

    const aiAgentAutomatedInteractions = useTrendFromMultipleMetricsTrend(
        filters,
        timezone,
        aiAgentAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
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
        aiAgentAutomatedInteractions.isFetching ||
        allAutomatedInteractions.isFetching ||
        billableTicketsExcludingAIAgent.isFetching

    const isError =
        aiAgentAutomatedInteractions.isError ||
        allAutomatedInteractions.isError ||
        billableTicketsExcludingAIAgent.isError

    return isAutomateNonFilteredDenominatorInAutomationRate
        ? getAIAgentAutomationRateUnfilteredDenominatorTrend({
              isFetching,
              isError,
              aiAgentAutomatedInteractions: aiAgentAutomatedInteractions.data,
              allAutomatedInteractions: allAutomatedInteractions.data,
              allAutomatedInteractionsByAutoResponders:
                  allAutomatedInteractionsByAutoResponders.data,
              billableTicketsCount: billableTicketsExcludingAIAgent.data,
          })
        : getAIAgentAutomationRateTrend(
              isFetching,
              isError,
              aiAgentAutomatedInteractions.data,
              billableTicketsExcludingAIAgent.data,
          )
}

export const fetchAIAgentAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    aiAgentUserId: number | undefined,
) => {
    return Promise.all([
        fetchTrendFromMultipleMetricsTrend(
            filters,
            timezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        ),
        fetchAllAutomatedInteractionsByAutoResponders(filters, timezone),
        fetchAllAutomatedInteractions(filters, timezone),
        fetchBillableTicketsExcludingAIAgent(filters, timezone, aiAgentUserId),
    ]).then(
        ([
            aiAgentAutomatedInteractions,
            allAutomatedInteractionsByAutoResponders,
            allAutomatedInteractions,
            billableTicketsExcludingAIAgent,
        ]) => {
            return isAutomateNonFilteredDenominatorInAutomationRate
                ? getAIAgentAutomationRateUnfilteredDenominatorTrend({
                      isFetching: false,
                      isError: false,
                      aiAgentAutomatedInteractions:
                          aiAgentAutomatedInteractions.data,
                      allAutomatedInteractions: allAutomatedInteractions.data,
                      allAutomatedInteractionsByAutoResponders:
                          allAutomatedInteractionsByAutoResponders.data,
                      billableTicketsCount:
                          billableTicketsExcludingAIAgent.data,
                  })
                : getAIAgentAutomationRateTrend(
                      false,
                      false,
                      aiAgentAutomatedInteractions.data,
                      billableTicketsExcludingAIAgent.data,
                  )
        },
    )
}

import { getAIAgentAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
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

    return getAIAgentAutomationRateUnfilteredDenominatorTrend({
        isFetching,
        isError,
        aiAgentAutomatedInteractions: aiAgentAutomatedInteractions.data,
        allAutomatedInteractions: allAutomatedInteractions.data,
        allAutomatedInteractionsByAutoResponders:
            allAutomatedInteractionsByAutoResponders.data,
        billableTicketsCount: billableTicketsExcludingAIAgent.data,
    })
}

export const fetchAIAgentAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
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
            return getAIAgentAutomationRateUnfilteredDenominatorTrend({
                isFetching: false,
                isError: false,
                aiAgentAutomatedInteractions: aiAgentAutomatedInteractions.data,
                allAutomatedInteractions: allAutomatedInteractions.data,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders.data,
                billableTicketsCount: billableTicketsExcludingAIAgent.data,
            })
        },
    )
}

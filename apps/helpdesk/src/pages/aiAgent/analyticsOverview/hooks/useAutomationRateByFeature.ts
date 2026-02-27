import type { ChartDataItem } from '@repo/reporting'

import { automationRateUnfilteredDenominator } from 'domains/reporting/hooks/automate/automateStatsFormulae'
import {
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    aiAgentAutomatedInteractionsQueryFactory,
    articleRecommendationAutomatedInteractionsQueryFactory,
    flowsAutomatedInteractionsQueryFactory,
    orderManagementAutomatedInteractionsQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import {
    aiAgentAutomatedInteractionsQueryV2Factory,
    articleRecommendationAutomatedInteractionsQueryV2Factory,
    flowsAutomatedInteractionsQueryV2Factory,
    orderManagementAutomatedInteractionsQueryV2Factory,
} from 'domains/reporting/models/scopes/automatedInteractions'

export const useAutomationRateByFeature = (): {
    data: ChartDataItem[] | undefined
    isLoading: boolean
    isError: boolean
} => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const aiAgentUserId = useAIAgentUserId()

    const aiAgentInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        aiAgentAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        aiAgentAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )

    const flowsInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        flowsAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        flowsAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )

    const articleRecommendationInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        articleRecommendationAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        articleRecommendationAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )

    const orderManagementInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        orderManagementAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        orderManagementAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
    )

    const allAutomatedInteractions = useAllAutomatedInteractions(
        cleanStatsFilters,
        userTimezone,
    )

    const allAutomatedInteractionsByAutoResponders =
        useAllAutomatedInteractionsByAutoResponders(
            cleanStatsFilters,
            userTimezone,
        )

    const billableTicketsExcludingAIAgent = useBillableTicketsExcludingAIAgent(
        cleanStatsFilters,
        userTimezone,
        aiAgentUserId,
    )

    const isLoading =
        aiAgentInteractions.isFetching ||
        flowsInteractions.isFetching ||
        articleRecommendationInteractions.isFetching ||
        orderManagementInteractions.isFetching ||
        allAutomatedInteractions.isFetching ||
        allAutomatedInteractionsByAutoResponders.isFetching ||
        billableTicketsExcludingAIAgent.isFetching

    const isError =
        aiAgentInteractions.isError ||
        flowsInteractions.isError ||
        articleRecommendationInteractions.isError ||
        orderManagementInteractions.isError ||
        allAutomatedInteractions.isError ||
        allAutomatedInteractionsByAutoResponders.isError ||
        billableTicketsExcludingAIAgent.isError

    if (
        !aiAgentInteractions.data ||
        !flowsInteractions.data ||
        !articleRecommendationInteractions.data ||
        !orderManagementInteractions.data ||
        !allAutomatedInteractions.data ||
        !allAutomatedInteractionsByAutoResponders.data ||
        !billableTicketsExcludingAIAgent.data
    ) {
        return {
            data: undefined,
            isLoading,
            isError,
        }
    }

    const allAutomatedInteractionsValue =
        allAutomatedInteractions.data.value ?? 0
    const allAutomatedInteractionsByAutoRespondersValue =
        allAutomatedInteractionsByAutoResponders.data.value ?? 0
    const billableTicketsValue = billableTicketsExcludingAIAgent.data.value ?? 0

    const features = [
        {
            name: 'AI Agent',
            interactions: aiAgentInteractions.data.value ?? 0,
            loading:
                aiAgentInteractions.isFetching ||
                allAutomatedInteractions.isFetching ||
                allAutomatedInteractionsByAutoResponders.isFetching ||
                billableTicketsExcludingAIAgent.isFetching,
        },
        {
            name: 'Flows',
            interactions: flowsInteractions.data.value ?? 0,
            loading:
                flowsInteractions.isFetching ||
                allAutomatedInteractions.isFetching ||
                allAutomatedInteractionsByAutoResponders.isFetching ||
                billableTicketsExcludingAIAgent.isFetching,
        },
        {
            name: 'Article Recommendation',
            interactions: articleRecommendationInteractions.data.value ?? 0,
            loading:
                articleRecommendationInteractions.isFetching ||
                allAutomatedInteractions.isFetching ||
                allAutomatedInteractionsByAutoResponders.isFetching ||
                billableTicketsExcludingAIAgent.isFetching,
        },
        {
            name: 'Order Management',
            interactions: orderManagementInteractions.data.value ?? 0,
            loading:
                orderManagementInteractions.isFetching ||
                allAutomatedInteractions.isFetching ||
                allAutomatedInteractionsByAutoResponders.isFetching ||
                billableTicketsExcludingAIAgent.isFetching,
        },
    ]

    const chartData: ChartDataItem[] = features.map(
        ({ name, interactions, loading }) => {
            if (loading) {
                return {
                    name,
                    value: null,
                }
            }
            const automationRate = automationRateUnfilteredDenominator({
                filteredAutomatedInteractions: interactions ?? 0,
                allAutomatedInteractions: allAutomatedInteractionsValue,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoRespondersValue,
                billableTicketsCount: billableTicketsValue,
            })

            return {
                name,
                value: +(automationRate * 100).toFixed(2),
            }
        },
    )

    return {
        data: chartData,
        isLoading,
        isError,
    }
}

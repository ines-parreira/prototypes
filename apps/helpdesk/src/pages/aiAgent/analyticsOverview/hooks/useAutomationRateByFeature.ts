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
import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
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
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import {
    automationRatePerFeature,
    automationRatePerFeatureQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

const MAP_DIMENSION_API_TO_UI: Record<string, string> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
}

export const useAutomationRateByFeature = (): {
    data: ChartDataItem[] | undefined
    isLoading: boolean
    isError: boolean
} => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    // We don't support double-reads for this metric as the V1 implementation doesn't use a single Cube
    const stage = useGetNewStatsFeatureFlagMigration(
        automationRatePerFeature.name,
    )
    const newQueryEnabled = stage === 'live' || stage === 'complete'
    const response = useStatsMetricPerDimension(
        automationRatePerFeatureQueryFactoryV2({
            filters: cleanStatsFilters,
            timezone: userTimezone,
        }),
        'automationFeatureType',
        newQueryEnabled,
    )
    const oldData = useAutomationRateByFeatureV1(!newQueryEnabled)

    return newQueryEnabled
        ? {
              isLoading: response.isFetching,
              isError: response.isError,
              data: response.data?.allValues
                  ?.filter((metricValue) =>
                      Object.keys(MAP_DIMENSION_API_TO_UI).includes(
                          metricValue.dimension.toString(),
                      ),
                  )
                  .map((metricValue) => {
                      return {
                          name: MAP_DIMENSION_API_TO_UI[
                              metricValue.dimension.toString()
                          ],
                          value: metricValue.value,
                      }
                  }),
          }
        : oldData
}

export const useAutomationRateByFeatureV1 = (
    enabled: boolean = true,
): {
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
        enabled,
    )

    const flowsInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        flowsAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        flowsAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
        enabled,
    )

    const articleRecommendationInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        articleRecommendationAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        articleRecommendationAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
        enabled,
    )

    const orderManagementInteractions = useTrendFromMultipleMetricsTrend(
        cleanStatsFilters,
        userTimezone,
        orderManagementAutomatedInteractionsQueryFactory,
        AutomationDatasetMeasure.AutomatedInteractions,
        orderManagementAutomatedInteractionsQueryV2Factory,
        'automatedInteractions',
        enabled,
    )

    const allAutomatedInteractions = useAllAutomatedInteractions(
        cleanStatsFilters,
        userTimezone,
        enabled,
    )

    const allAutomatedInteractionsByAutoResponders =
        useAllAutomatedInteractionsByAutoResponders(
            cleanStatsFilters,
            userTimezone,
            enabled,
        )

    const billableTicketsExcludingAIAgent = useBillableTicketsExcludingAIAgent(
        cleanStatsFilters,
        userTimezone,
        aiAgentUserId,
        enabled,
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

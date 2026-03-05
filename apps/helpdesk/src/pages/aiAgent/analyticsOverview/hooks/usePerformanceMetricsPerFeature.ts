import { useMemo } from 'react'

import { useTrendFromMultipleMetricsTrend } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTicketHandleTimeTrend } from 'domains/reporting/hooks/metricTrends'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    aiAgentHandoversQueryFactory,
    articleRecommendationAutomatedInteractionsQueryFactory,
    flowsAutomatedInteractionsQueryFactory,
    flowsHandoversQueryFactory,
    orderManagementAutomatedInteractionsQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import {
    aiAgentHandoversQueryV2Factory,
    articleRecommendationAutomatedInteractionsQueryV2Factory,
    flowsAutomatedInteractionsQueryV2Factory,
    flowsHandoversQueryV2Factory,
    orderManagementAutomatedInteractionsQueryV2Factory,
} from 'domains/reporting/models/scopes/automatedInteractions'
import { useHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useHandoverInteractionsTrend'
import { useAutomationRateByFeature } from 'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export type FeatureName =
    | 'AI Agent'
    | 'Flows'
    | 'Article Recommendation'
    | 'Order Management'

export type FeatureMetrics = {
    feature: FeatureName
    automationRate: number | null
    automatedInteractions: number | null
    handoverCount: number | null
    costSaved: number | null
    timeSaved: number | null
}

export type PerformanceMetricsPerFeature = {
    data: FeatureMetrics[] | undefined
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automationRate: boolean
        automatedInteractions: boolean
        handovers: boolean
        timeSaved: boolean
        costSaved: boolean
    }
}

export const usePerformanceMetricsPerFeature =
    (): PerformanceMetricsPerFeature => {
        const { statsFilters, userTimezone } = useAutomateFilters()

        const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
            AGENT_COST_PER_TICKET,
        )

        const aiAgentInteractions = useHandoverInteractionsTrend(
            statsFilters,
            userTimezone,
        )

        const flowsInteractions = useTrendFromMultipleMetricsTrend(
            statsFilters,
            userTimezone,
            flowsAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            flowsAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        )

        const articleRecommendationInteractions =
            useTrendFromMultipleMetricsTrend(
                statsFilters,
                userTimezone,
                articleRecommendationAutomatedInteractionsQueryFactory,
                AutomationDatasetMeasure.AutomatedInteractions,
                articleRecommendationAutomatedInteractionsQueryV2Factory,
                'automatedInteractions',
            )

        const orderManagementInteractions = useTrendFromMultipleMetricsTrend(
            statsFilters,
            userTimezone,
            orderManagementAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            orderManagementAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        )

        const aiAgentHandovers = useTrendFromMultipleMetricsTrend(
            statsFilters,
            userTimezone,
            aiAgentHandoversQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            aiAgentHandoversQueryV2Factory,
            'automatedInteractions',
        )

        const flowsHandovers = useTrendFromMultipleMetricsTrend(
            statsFilters,
            userTimezone,
            flowsHandoversQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            flowsHandoversQueryV2Factory,
            'automatedInteractions',
        )

        const ticketHandleTime = useTicketHandleTimeTrend(
            statsFilters,
            userTimezone,
        )

        const automationRateByFeature = useAutomationRateByFeature()

        const isLoading =
            aiAgentInteractions.isFetching ||
            flowsInteractions.isFetching ||
            articleRecommendationInteractions.isFetching ||
            orderManagementInteractions.isFetching ||
            aiAgentHandovers.isFetching ||
            flowsHandovers.isFetching ||
            ticketHandleTime.isFetching ||
            automationRateByFeature.isLoading

        const isError =
            aiAgentInteractions.isError ||
            flowsInteractions.isError ||
            articleRecommendationInteractions.isError ||
            orderManagementInteractions.isError ||
            aiAgentHandovers.isError ||
            flowsHandovers.isError ||
            ticketHandleTime.isError ||
            automationRateByFeature.isError

        const isZeroOrMissing = (value?: number | null) =>
            value == null || value === 0 || Number.isNaN(value)

        const isEmpty = useMemo(() => {
            if (isLoading) return false

            const allAutomationRatesZero =
                automationRateByFeature.data?.every(
                    (item) => item.value === 0,
                ) ?? true

            return (
                isZeroOrMissing(ticketHandleTime.data?.value) &&
                isZeroOrMissing(aiAgentInteractions.data?.value) &&
                isZeroOrMissing(aiAgentHandovers.data?.value) &&
                isZeroOrMissing(flowsInteractions.data?.value) &&
                isZeroOrMissing(flowsHandovers.data?.value) &&
                isZeroOrMissing(
                    articleRecommendationInteractions.data?.value,
                ) &&
                isZeroOrMissing(orderManagementInteractions.data?.value) &&
                isZeroOrMissing(costSavedPerInteraction) &&
                allAutomationRatesZero
            )
        }, [
            isLoading,
            ticketHandleTime.data?.value,
            aiAgentInteractions.data?.value,
            aiAgentHandovers.data?.value,
            flowsInteractions.data?.value,
            flowsHandovers.data?.value,
            articleRecommendationInteractions.data?.value,
            orderManagementInteractions.data?.value,
            costSavedPerInteraction,
            automationRateByFeature.data,
        ])

        const aiAgentMetrics = useMemo(() => {
            const handleTimeValue = ticketHandleTime.data?.value ?? null
            const interactions = aiAgentInteractions.data?.value ?? null
            const handovers = aiAgentHandovers.data?.value ?? null
            const automationRate =
                automationRateByFeature.data?.find(
                    (item) => item.name === 'AI Agent',
                )?.value ?? null

            const costSaved =
                interactions !== null
                    ? interactions * costSavedPerInteraction
                    : null
            const timeSaved =
                interactions !== null && handleTimeValue !== null
                    ? interactions * handleTimeValue
                    : null

            return {
                feature: 'AI Agent' as FeatureName,
                automationRate,
                automatedInteractions: interactions,
                handoverCount: handovers,
                costSaved,
                timeSaved,
            }
        }, [
            aiAgentInteractions.data?.value,
            aiAgentHandovers.data?.value,
            ticketHandleTime.data?.value,
            automationRateByFeature.data,
            costSavedPerInteraction,
        ])

        const flowsMetrics = useMemo(() => {
            const handleTimeValue = ticketHandleTime.data?.value ?? null
            const interactions = flowsInteractions.data?.value ?? null
            const handovers = flowsHandovers.data?.value ?? null
            const automationRate =
                automationRateByFeature.data?.find(
                    (item) => item.name === 'Flows',
                )?.value ?? null

            const costSaved =
                interactions !== null
                    ? interactions * costSavedPerInteraction
                    : null
            const timeSaved =
                interactions !== null && handleTimeValue !== null
                    ? interactions * handleTimeValue
                    : null

            return {
                feature: 'Flows' as FeatureName,
                automationRate,
                automatedInteractions: interactions,
                handoverCount: handovers,
                costSaved,
                timeSaved,
            }
        }, [
            flowsInteractions.data?.value,
            flowsHandovers.data?.value,
            ticketHandleTime.data?.value,
            automationRateByFeature.data,
            costSavedPerInteraction,
        ])

        const articleRecommendationMetrics = useMemo(() => {
            const handleTimeValue = ticketHandleTime.data?.value ?? null
            const interactions =
                articleRecommendationInteractions.data?.value ?? null
            const automationRate =
                automationRateByFeature.data?.find(
                    (item) => item.name === 'Article Recommendation',
                )?.value ?? null

            const costSaved =
                interactions !== null
                    ? interactions * costSavedPerInteraction
                    : null
            const timeSaved =
                interactions !== null && handleTimeValue !== null
                    ? interactions * handleTimeValue
                    : null

            return {
                feature: 'Article Recommendation' as FeatureName,
                automationRate,
                automatedInteractions: interactions,
                handoverCount: null,
                costSaved,
                timeSaved,
            }
        }, [
            articleRecommendationInteractions.data?.value,
            ticketHandleTime.data?.value,
            automationRateByFeature.data,
            costSavedPerInteraction,
        ])

        const orderManagementMetrics = useMemo(() => {
            const handleTimeValue = ticketHandleTime.data?.value ?? null
            const interactions = orderManagementInteractions.data?.value ?? null
            const automationRate =
                automationRateByFeature.data?.find(
                    (item) => item.name === 'Order Management',
                )?.value ?? null

            const costSaved =
                interactions !== null
                    ? interactions * costSavedPerInteraction
                    : null
            const timeSaved =
                interactions !== null && handleTimeValue !== null
                    ? interactions * handleTimeValue
                    : null

            return {
                feature: 'Order Management' as FeatureName,
                automationRate,
                automatedInteractions: interactions,
                handoverCount: null,
                costSaved,
                timeSaved,
            }
        }, [
            orderManagementInteractions.data?.value,
            ticketHandleTime.data?.value,
            automationRateByFeature.data,
            costSavedPerInteraction,
        ])

        const data = useMemo(
            () =>
                isEmpty
                    ? []
                    : [
                          aiAgentMetrics,
                          articleRecommendationMetrics,
                          flowsMetrics,
                          orderManagementMetrics,
                      ],
            [
                isEmpty,
                aiAgentMetrics,
                flowsMetrics,
                articleRecommendationMetrics,
                orderManagementMetrics,
            ],
        )

        const loadingStates = useMemo(
            () => ({
                automationRate:
                    automationRateByFeature.isLoading ||
                    !automationRateByFeature.data,
                automatedInteractions:
                    aiAgentInteractions.isFetching ||
                    flowsInteractions.isFetching ||
                    articleRecommendationInteractions.isFetching ||
                    orderManagementInteractions.isFetching,
                handovers:
                    aiAgentHandovers.isFetching || flowsHandovers.isFetching,
                timeSaved: ticketHandleTime.isFetching,
                costSaved:
                    aiAgentInteractions.isFetching ||
                    flowsInteractions.isFetching ||
                    articleRecommendationInteractions.isFetching ||
                    orderManagementInteractions.isFetching,
            }),
            [
                automationRateByFeature.isLoading,
                automationRateByFeature.data,
                aiAgentInteractions.isFetching,
                flowsInteractions.isFetching,
                articleRecommendationInteractions.isFetching,
                orderManagementInteractions.isFetching,
                aiAgentHandovers.isFetching,
                flowsHandovers.isFetching,
                ticketHandleTime.isFetching,
            ],
        )

        return {
            data,
            isLoading,
            isError,
            loadingStates,
        }
    }

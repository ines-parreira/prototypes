import { useMemo } from 'react'

import type { ChartDataItem } from '@repo/reporting'

import { useTrendFromMultipleMetricsTrend } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTicketHandleTimeTrend } from 'domains/reporting/hooks/metricTrends'
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
import { useAutomationRateByFeature } from 'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature'
import { useHandoverInteractionsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature'
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

const FEATURE_TO_AUTOMATION_TYPE: Record<FeatureName, AutomationFeatureType> = {
    'AI Agent': AutomationFeatureType.AiAgent,
    Flows: AutomationFeatureType.Flows,
    'Article Recommendation': AutomationFeatureType.ArticleRecommendation,
    'Order Management': AutomationFeatureType.OrderManagement,
}

export type RawPerformanceData = {
    aiAgentInteractionsValue: number | null | undefined
    flowsInteractionsValue: number | null | undefined
    articleRecommendationInteractionsValue: number | null | undefined
    orderManagementInteractionsValue: number | null | undefined
    handoversByFeature: Partial<
        Record<AutomationFeatureType, number | null | undefined>
    >
    handleTimeValue: number | null | undefined
    automationRateByFeature: ChartDataItem[] | undefined
    costSavedPerInteraction: number
}

export const buildPerformanceMetrics = (
    raw: RawPerformanceData,
    options?: { skipEmptyCheck?: boolean },
): FeatureMetrics[] => {
    const isZeroOrMissing = (value?: number | null) =>
        value == null || value === 0 || Number.isNaN(value)

    const allAutomationRatesZero =
        raw.automationRateByFeature?.every((item) => item.value === 0) ?? true

    const isEmpty =
        isZeroOrMissing(raw.handleTimeValue) &&
        isZeroOrMissing(raw.aiAgentInteractionsValue) &&
        isZeroOrMissing(raw.flowsInteractionsValue) &&
        isZeroOrMissing(raw.articleRecommendationInteractionsValue) &&
        isZeroOrMissing(raw.orderManagementInteractionsValue) &&
        Object.values(raw.handoversByFeature).every(isZeroOrMissing) &&
        allAutomationRatesZero

    if (!options?.skipEmptyCheck && isEmpty) return []

    const buildMetric = (
        feature: FeatureName,
        interactions: number | null | undefined,
    ): FeatureMetrics => {
        const interactionsValue = interactions ?? null
        const automationRate =
            raw.automationRateByFeature?.find((item) => item.name === feature)
                ?.value ?? null
        const handoverCount =
            raw.handoversByFeature[FEATURE_TO_AUTOMATION_TYPE[feature]] ?? null

        return {
            feature,
            automationRate,
            automatedInteractions: interactionsValue,
            handoverCount,
            costSaved:
                interactionsValue !== null
                    ? interactionsValue * raw.costSavedPerInteraction
                    : null,
            timeSaved:
                interactionsValue !== null && raw.handleTimeValue != null
                    ? interactionsValue * raw.handleTimeValue
                    : null,
        }
    }

    return [
        buildMetric('AI Agent', raw.aiAgentInteractionsValue),
        buildMetric(
            'Article Recommendation',
            raw.articleRecommendationInteractionsValue,
        ),
        buildMetric('Flows', raw.flowsInteractionsValue),
        buildMetric('Order Management', raw.orderManagementInteractionsValue),
    ]
}

export const usePerformanceMetricsPerFeature =
    (): PerformanceMetricsPerFeature => {
        const { statsFilters, userTimezone } = useAutomateFilters()

        const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
            AGENT_COST_PER_TICKET,
        )

        const aiAgentInteractions = useTrendFromMultipleMetricsTrend(
            statsFilters,
            userTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            aiAgentAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
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

        const handoverInteractionsPerFeature =
            useHandoverInteractionsPerFeature(statsFilters, userTimezone)

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
            handoverInteractionsPerFeature.isFetching ||
            ticketHandleTime.isFetching ||
            automationRateByFeature.isLoading

        const isError =
            aiAgentInteractions.isError ||
            flowsInteractions.isError ||
            articleRecommendationInteractions.isError ||
            orderManagementInteractions.isError ||
            handoverInteractionsPerFeature.isError ||
            ticketHandleTime.isError ||
            automationRateByFeature.isError

        const data = useMemo(
            () =>
                buildPerformanceMetrics(
                    {
                        aiAgentInteractionsValue:
                            aiAgentInteractions.data?.value,
                        flowsInteractionsValue: flowsInteractions.data?.value,
                        articleRecommendationInteractionsValue:
                            articleRecommendationInteractions.data?.value,
                        orderManagementInteractionsValue:
                            orderManagementInteractions.data?.value,
                        handoversByFeature: Object.fromEntries(
                            (
                                handoverInteractionsPerFeature.data
                                    ?.allValues ?? []
                            ).map((v) => [v.dimension, v.value]),
                        ),
                        handleTimeValue: ticketHandleTime.data?.value,
                        automationRateByFeature: automationRateByFeature.data,
                        costSavedPerInteraction,
                    },
                    { skipEmptyCheck: isLoading },
                ),
            [
                isLoading,
                aiAgentInteractions.data?.value,
                flowsInteractions.data?.value,
                articleRecommendationInteractions.data?.value,
                orderManagementInteractions.data?.value,
                handoverInteractionsPerFeature.data?.allValues,
                ticketHandleTime.data?.value,
                automationRateByFeature.data,
                costSavedPerInteraction,
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
                handovers: handoverInteractionsPerFeature.isFetching,
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
                handoverInteractionsPerFeature.isFetching,
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

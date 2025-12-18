import { useMemo } from 'react'

import { useTrendFromMultipleMetricsTrend } from 'domains/reporting/hooks/automate/automationTrends'
import { FLOW_HANDOVER_TICKET_CREATED } from 'domains/reporting/hooks/automate/types'
import { useTicketHandleTimeTrend } from 'domains/reporting/hooks/metricTrends'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    aiAgentAutomatedInteractionsQueryFactory,
    articleRecommendationAutomatedInteractionsQueryFactory,
    automationDatasetQueryFactory,
    flowsAutomatedInteractionsQueryFactory,
    orderManagementAutomatedInteractionsQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
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
        const { cleanStatsFilters, userTimezone } = useStatsFilters()

        const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
            AGENT_COST_PER_TICKET,
        )

        const aiAgentInteractions = useTrendFromMultipleMetricsTrend(
            cleanStatsFilters,
            userTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )

        const flowsInteractions = useTrendFromMultipleMetricsTrend(
            cleanStatsFilters,
            userTimezone,
            flowsAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )

        const articleRecommendationInteractions =
            useTrendFromMultipleMetricsTrend(
                cleanStatsFilters,
                userTimezone,
                articleRecommendationAutomatedInteractionsQueryFactory,
                AutomationDatasetMeasure.AutomatedInteractions,
            )

        const orderManagementInteractions = useTrendFromMultipleMetricsTrend(
            cleanStatsFilters,
            userTimezone,
            orderManagementAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )

        const aiAgentHandovers = useTrendFromMultipleMetricsTrend(
            cleanStatsFilters,
            userTimezone,
            (filters, timezone) => {
                const baseQuery = automationDatasetQueryFactory(
                    filters,
                    timezone,
                )
                return {
                    ...baseQuery,
                    filters: [
                        ...baseQuery.filters,
                        {
                            member: AutomationDatasetFilterMember.EventType,
                            operator: ReportingFilterOperator.Equals,
                            values: ['ai_agent_ticket_handover'],
                        },
                    ],
                }
            },
            AutomationDatasetMeasure.AutomatedInteractions,
        )

        const flowsHandovers = useTrendFromMultipleMetricsTrend(
            cleanStatsFilters,
            userTimezone,
            (filters, timezone) => {
                const baseQuery = automationDatasetQueryFactory(
                    filters,
                    timezone,
                )
                return {
                    ...baseQuery,
                    filters: [
                        ...baseQuery.filters,
                        {
                            member: AutomationDatasetFilterMember.EventType,
                            operator: ReportingFilterOperator.Equals,
                            values: [FLOW_HANDOVER_TICKET_CREATED],
                        },
                    ],
                }
            },
            AutomationDatasetMeasure.AutomatedInteractions,
        )

        const ticketHandleTime = useTicketHandleTimeTrend(
            cleanStatsFilters,
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
            () => [
                aiAgentMetrics,
                articleRecommendationMetrics,
                flowsMetrics,
                orderManagementMetrics,
            ],
            [
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

import { formatMetricValue } from '@repo/reporting'

import { automationRateUnfilteredDenominator } from 'domains/reporting/hooks/automate/automateStatsFormulae'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { fetchTicketHandleTimeTrend } from 'domains/reporting/hooks/metricTrends'
import { fetchStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
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
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { fetchHandoverInteractionsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature'
import type { FeatureMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

import { PERFORMANCE_BREAKDOWN_COLUMNS } from '../components/PerformanceBreakdownTable/columns'
import { buildPerformanceMetrics } from './usePerformanceMetricsPerFeature'

const PERFORMANCE_BREAKDOWN_FILENAME = 'performance-breakdown'

const MAP_DIMENSION_API_TO_UI: Record<string, string> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
}

const fetchAutomationRateByFeatureData = async (
    statsFilters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        automationRatePerFeature.name,
    )
    const newQueryEnabled = stage === 'live' || stage === 'complete'

    if (newQueryEnabled) {
        const result = await fetchStatsMetricPerDimension(
            automationRatePerFeatureQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            'automationFeatureType',
        )
        return result.data?.allValues
            ?.filter((metricValue) =>
                Object.keys(MAP_DIMENSION_API_TO_UI).includes(
                    metricValue.dimension.toString(),
                ),
            )
            .map((metricValue) => ({
                name: MAP_DIMENSION_API_TO_UI[metricValue.dimension.toString()],
                value: metricValue.value,
            }))
    }

    const [
        aiAgentInteractionsV1,
        flowsInteractionsV1,
        articleRecommendationInteractionsV1,
        orderManagementInteractionsV1,
        allAutomatedInteractions,
        allAutomatedInteractionsByAutoResponders,
        billableTickets,
    ] = await Promise.all([
        fetchTrendFromMultipleMetricsTrend(
            statsFilters,
            timezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            aiAgentAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchTrendFromMultipleMetricsTrend(
            statsFilters,
            timezone,
            flowsAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            flowsAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchTrendFromMultipleMetricsTrend(
            statsFilters,
            timezone,
            articleRecommendationAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            articleRecommendationAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchTrendFromMultipleMetricsTrend(
            statsFilters,
            timezone,
            orderManagementAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            orderManagementAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchAllAutomatedInteractions(statsFilters, timezone),
        fetchAllAutomatedInteractionsByAutoResponders(statsFilters, timezone),
        fetchBillableTicketsExcludingAIAgent(
            statsFilters,
            timezone,
            aiAgentUserId,
        ),
    ])

    const allAutomatedInteractionsValue =
        allAutomatedInteractions.data?.value ?? 0
    const allAutomatedInteractionsByAutoRespondersValue =
        allAutomatedInteractionsByAutoResponders.data?.value ?? 0
    const billableTicketsValue = billableTickets.data?.value ?? 0

    return [
        {
            name: 'AI Agent',
            interactions: aiAgentInteractionsV1.data?.value ?? 0,
        },
        { name: 'Flows', interactions: flowsInteractionsV1.data?.value ?? 0 },
        {
            name: 'Article Recommendation',
            interactions: articleRecommendationInteractionsV1.data?.value ?? 0,
        },
        {
            name: 'Order Management',
            interactions: orderManagementInteractionsV1.data?.value ?? 0,
        },
    ].map(({ name, interactions }) => ({
        name,
        value: +(
            automationRateUnfilteredDenominator({
                filteredAutomatedInteractions: interactions,
                allAutomatedInteractions: allAutomatedInteractionsValue,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoRespondersValue,
                billableTicketsCount: billableTicketsValue,
            }) * 100
        ).toFixed(2),
    }))
}

export const fetchPerformanceMetricsPerFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
): Promise<{ fileName: string; files: Record<string, string> }> => {
    const periodFilters: StatsFilters = { period: statsFilters.period }
    const fileName = getCsvFileNameWithDates(
        periodFilters.period,
        PERFORMANCE_BREAKDOWN_FILENAME,
    )

    const [
        aiAgentInteractions,
        flowsInteractions,
        articleRecommendationInteractions,
        orderManagementInteractions,
        handoverInteractionsPerFeature,
        ticketHandleTime,
        automationRateByFeature,
    ] = await Promise.all([
        fetchTrendFromMultipleMetricsTrend(
            periodFilters,
            timezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            aiAgentAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchTrendFromMultipleMetricsTrend(
            periodFilters,
            timezone,
            flowsAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            flowsAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchTrendFromMultipleMetricsTrend(
            periodFilters,
            timezone,
            articleRecommendationAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            articleRecommendationAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchTrendFromMultipleMetricsTrend(
            periodFilters,
            timezone,
            orderManagementAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            orderManagementAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
        ),
        fetchHandoverInteractionsPerFeature(periodFilters, timezone),
        fetchTicketHandleTimeTrend(periodFilters, timezone),
        fetchAutomationRateByFeatureData(
            periodFilters,
            timezone,
            aiAgentUserId,
        ),
    ])

    const handoverAllValues =
        handoverInteractionsPerFeature.data?.allValues ?? []

    const data = buildPerformanceMetrics({
        aiAgentInteractionsValue: aiAgentInteractions.data?.value,
        flowsInteractionsValue: flowsInteractions.data?.value,
        articleRecommendationInteractionsValue:
            articleRecommendationInteractions.data?.value,
        orderManagementInteractionsValue:
            orderManagementInteractions.data?.value,
        handoversByFeature: Object.fromEntries(
            handoverAllValues.map((v) => [v.dimension, v.value]),
        ),
        handleTimeValue: ticketHandleTime.data?.value,
        automationRateByFeature,
        costSavedPerInteraction,
    })

    if (data.length === 0) {
        return { fileName, files: { [fileName]: '' } }
    }

    const headers = [
        'Feature',
        ...PERFORMANCE_BREAKDOWN_COLUMNS.map((col) => col.label),
    ]
    const rows = data.map((row) => [
        row.feature,
        ...PERFORMANCE_BREAKDOWN_COLUMNS.map((col) =>
            formatMetricValue(
                row[
                    col.accessorKey as Exclude<keyof FeatureMetrics, 'feature'>
                ],
                col.metricFormat,
            ),
        ),
    ])

    return { fileName, files: { [fileName]: createCsv([headers, ...rows]) } }
}

export const fetchPerformanceMetricsPerFeatureReport: ReportFetch = async (
    statsFilters,
    timezone,
    _granularity,
    context,
) => ({
    isLoading: false,
    ...(await fetchPerformanceMetricsPerFeature(
        statsFilters,
        timezone,
        context.aiAgentUserId,
        context.costSavedPerInteraction,
    )),
})

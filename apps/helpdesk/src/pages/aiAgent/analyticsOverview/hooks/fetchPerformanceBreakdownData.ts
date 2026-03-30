import { formatMetricValue } from '@repo/reporting'

import { fetchTrendFromMultipleMetricsTrend } from 'domains/reporting/hooks/automate/automationTrends'
import type { ConfigurableGraphFetch } from 'domains/reporting/hooks/common/useConfigurableGraphsReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { fetchTicketHandleTimeTrend } from 'domains/reporting/hooks/metricTrends'
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
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { PERFORMANCE_BREAKDOWN_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { fetchAutomationRateByFeatureData } from 'pages/aiAgent/analyticsOverview/hooks/useAutomationRateByFeature'
import { fetchHandoverInteractionsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/useHandoverInteractionsPerFeature'
import type { FeatureMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'
import { buildPerformanceMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { createCsv } from 'utils/file'

const PERFORMANCE_BREAKDOWN_FILENAME = 'performance-breakdown'

const MAP_DIMENSION_API_TO_UI: Record<string, string> = {
    [AutomationFeatureType.AiAgent]: 'AI Agent',
    [AutomationFeatureType.Flows]: 'Flows',
    [AutomationFeatureType.OrderManagement]: 'Order Management',
    [AutomationFeatureType.ArticleRecommendation]: 'Article Recommendation',
}

export const fetchPerformanceMetricsPerFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
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
        automationRateResult,
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
        fetchAutomationRateByFeatureData(periodFilters, timezone),
    ])

    const handoverAllValues =
        handoverInteractionsPerFeature.data?.allValues ?? []

    const automationRateByFeature = automationRateResult.data?.allValues
        ?.filter((metricValue) =>
            Object.keys(MAP_DIMENSION_API_TO_UI).includes(
                metricValue.dimension.toString(),
            ),
        )
        .map((metricValue) => ({
            name: MAP_DIMENSION_API_TO_UI[metricValue.dimension.toString()],
            value: metricValue.value,
        }))

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

export const fetchPerformanceMetricsPerFeatureAsConfigurableTable: ConfigurableGraphFetch =
    async (
        _savedMeasure,
        _savedDimension,
        filters,
        timezone,
        _granularity,
        extra,
    ) => {
        const { files } = await fetchPerformanceMetricsPerFeature(
            filters,
            timezone,
            extra?.costSavedPerInteraction,
        )
        return { files }
    }

import { useMemo } from 'react'

import { supportAgentAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { AiAgentConfigurableGraphWrapper as ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/AiAgentConfigurableGraphWrapper'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import {
    getLineChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
    customDashboardChartSchema?: DashboardChartSchema
}

export const SUPPORT_LINE_CHART_METRICS: LineChartMetricConfig[] = [
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            supportAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'aiIntentCustomField',
        ],
    },
    {
        measure: 'medianDecreaseInFirstResponseTime',
        name: 'Decrease in first response time',
        metricFormat: 'duration' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'aiIntentCustomField',
        ],
    },
]

export const AnalyticsAiAgentSupportConfigurableLine = ({
    chartId,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const { statsFilters, userTimezone, granularity } = useAiAgentStatsFilters()
    const stores = useStoreIntegrations()

    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                SUPPORT_LINE_CHART_METRICS,
                statsFilters,
                userTimezone,
                granularity,
                { stores },
            ),
        [statsFilters, userTimezone, granularity, stores],
    )

    return (
        <ConfigurableGraphWrapper
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
            customDashboardChartSchema={customDashboardChartSchema}
        />
    )
}

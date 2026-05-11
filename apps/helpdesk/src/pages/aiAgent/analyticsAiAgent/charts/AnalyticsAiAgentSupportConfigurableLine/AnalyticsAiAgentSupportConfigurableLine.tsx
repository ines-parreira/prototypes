import { useMemo } from 'react'

import { dynamicSupportAgentAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import {
    getLineChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_AnalyticsSupportAgentLineChart } from './DEPRECATED_AnalyticsSupportAgentLineChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const SUPPORT_LINE_CHART_METRICS: LineChartMetricConfig[] = [
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            dynamicSupportAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
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
            DeprecatedChart={DEPRECATED_AnalyticsSupportAgentLineChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

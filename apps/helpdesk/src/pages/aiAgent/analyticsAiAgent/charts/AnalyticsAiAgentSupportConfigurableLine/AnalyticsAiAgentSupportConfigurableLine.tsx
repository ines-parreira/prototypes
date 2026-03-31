import { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    dynamicSupportAgentAutomatedInteractionsQueryFactoryV2,
    dynamicSupportAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import {
    dynamicSupportAgentDecreaseInFRTQueryFactoryV2,
    dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
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
        trendQueryFactory:
            dynamicSupportAgentAutomatedInteractionsQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicSupportAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId'],
    },
    {
        measure: 'averageDecreaseInFirstResponseTime',
        name: 'Decrease in first response time',
        metricFormat: 'duration' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicSupportAgentDecreaseInFRTQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId'],
    },
]

export const AnalyticsAiAgentSupportConfigurableLine = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()
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

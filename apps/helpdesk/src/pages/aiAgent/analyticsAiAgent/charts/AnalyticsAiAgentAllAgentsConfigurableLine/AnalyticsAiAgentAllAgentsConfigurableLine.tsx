import { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
    dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import {
    dynamicTotalSalesAmountQueryFactoryV2,
    dynamicTotalSalesAmountTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import {
    dynamicAllAgentsAutomationRateQueryFactoryV2,
    dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_AIAgentAutomationLineChart } from './DEPRECATED_AIAgentAutomationLineChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const ALL_AGENTS_LINE_CHART_METRICS: LineChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'AI Agent automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicAllAgentsAutomationRateQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId', 'aiAgentRole'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId', 'aiAgentRole'],
    },
    {
        measure: 'totalSalesAmount',
        name: 'Total sales',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicTotalSalesAmountQueryFactoryV2,
        timeSeriesQueryFactory: dynamicTotalSalesAmountTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId'],
    },
]

export const AnalyticsAiAgentAllAgentsConfigurableLine = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()
    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                ALL_AGENTS_LINE_CHART_METRICS,
                statsFilters,
                userTimezone,
                granularity,
            ),
        [statsFilters, userTimezone, granularity],
    )

    return (
        <ConfigurableGraphWrapper
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            DeprecatedChart={DEPRECATED_AIAgentAutomationLineChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

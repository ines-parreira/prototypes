import { useMemo } from 'react'

import {
    dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
    dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import {
    dynamicConversionRateQueryFactoryV2,
    dynamicConversionRateTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
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
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import {
    getLineChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
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
        dimensions: ['overall', 'channel', 'storeIntegrationId'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'aiAgentRole',
            'aiIntentCustomField',
        ],
    },
    {
        measure: 'conversionRate',
        name: 'Conversion rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicConversionRateQueryFactoryV2,
        timeSeriesQueryFactory: dynamicConversionRateTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'engagementType',
        ],
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
    const { statsFilters, userTimezone, granularity } = useAiAgentStatsFilters()
    const stores = useStoreIntegrations()
    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                ALL_AGENTS_LINE_CHART_METRICS,
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
            DeprecatedChart={DEPRECATED_AIAgentAutomationLineChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

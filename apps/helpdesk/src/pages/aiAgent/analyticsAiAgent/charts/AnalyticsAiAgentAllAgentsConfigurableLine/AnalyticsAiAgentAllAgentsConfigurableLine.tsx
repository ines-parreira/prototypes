import { useMemo } from 'react'

import { allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicConversionRateTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import { dynamicTotalSalesAmountTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import { dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type {
    ChartConfig,
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
}

export const ALL_AGENTS_LINE_CHART_METRICS: LineChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'AI Agent automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
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
        timeSeriesQueryFactory: dynamicConversionRateTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'engagementType',
            'aiIntentCustomField',
        ],
    },
    {
        measure: 'totalSalesAmount',
        name: 'Revenue influenced',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
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
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

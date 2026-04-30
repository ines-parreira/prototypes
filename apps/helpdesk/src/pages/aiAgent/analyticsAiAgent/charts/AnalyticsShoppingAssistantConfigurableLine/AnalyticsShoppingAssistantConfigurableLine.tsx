import { useMemo } from 'react'

import { dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicRevenuePerInteractionTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import { dynamicConversionRateTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import { dynamicTotalSalesAmountTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
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

import { DEPRECATED_AnalyticsShoppingAssistantLineChart } from './DEPRECATED_AnalyticsShoppingAssistantLineChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const SHOPPING_ASSISTANT_LINE_CHART_METRICS: LineChartMetricConfig[] = [
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
        ],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
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
        name: 'Total sales',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory: dynamicTotalSalesAmountTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'engagementType',
        ],
    },
    {
        measure: 'revenuePerInteraction',
        name: 'Revenue per interaction',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory:
            dynamicRevenuePerInteractionTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'engagementType',
        ],
    },
]

export const AnalyticsShoppingAssistantConfigurableLine = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone, granularity } = useAiAgentStatsFilters()
    const stores = useStoreIntegrations()
    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                SHOPPING_ASSISTANT_LINE_CHART_METRICS,
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
            DeprecatedChart={DEPRECATED_AnalyticsShoppingAssistantLineChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

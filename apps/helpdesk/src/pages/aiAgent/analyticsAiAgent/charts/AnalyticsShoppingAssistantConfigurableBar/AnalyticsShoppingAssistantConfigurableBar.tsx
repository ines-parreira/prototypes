import { useMemo } from 'react'

import { shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicRevenuePerInteractionQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import { dynamicConversionRateQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import {
    dynamicOrdersInfluencedCountQueryFactoryV2,
    dynamicTotalSalesAmountQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { AiAgentConfigurableGraphWrapper as ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/AiAgentConfigurableGraphWrapper'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import {
    getBarChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { BarChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
    customDashboardChartSchema?: DashboardChartSchema
}

export const SHOPPING_ASSISTANT_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'conversionRate',
        name: 'Conversion rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicConversionRateQueryFactoryV2,
        dimensions: [
            'channel',
            'storeIntegrationId',
            'engagementType',
            'aiIntentCustomField',
        ],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory:
            shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2,
        dimensions: [
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
        queryFactory: dynamicTotalSalesAmountQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'engagementType'],
    },
    {
        measure: 'revenuePerInteraction',
        name: 'Revenue influenced per interaction',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicRevenuePerInteractionQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'engagementType'],
    },
    {
        measure: 'ordersInfluencedCount',
        name: 'Orders influenced',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOrdersInfluencedCountQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'engagementType'],
    },
]

export const AnalyticsShoppingAssistantConfigurableBar = ({
    chartId,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const stores = useStoreIntegrations()
    const metrics = useMemo(
        () =>
            getBarChartGraphConfig(
                SHOPPING_ASSISTANT_BAR_CHART_METRICS,
                statsFilters,
                userTimezone,
                { stores },
            ),
        [statsFilters, userTimezone, stores],
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

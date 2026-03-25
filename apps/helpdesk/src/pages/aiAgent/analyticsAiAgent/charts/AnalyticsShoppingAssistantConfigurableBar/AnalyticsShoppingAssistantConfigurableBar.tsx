import { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicRevenuePerInteractionQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import {
    dynamicOrdersInfluencedCountQueryFactoryV2,
    dynamicTotalSalesAmountQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import {
    getBarChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { BarChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_TotalSalesByProductComboChart } from './DEPRECATED_TotalSalesByProductComboChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const SHOPPING_ASSISTANT_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory:
            dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'engagementType'],
    },
    {
        measure: 'totalSalesAmount',
        name: 'Total sales',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicTotalSalesAmountQueryFactoryV2,
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
    {
        measure: 'revenuePerInteraction',
        name: 'Revenue per interaction',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicRevenuePerInteractionQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'engagementType'],
    },
]

export const AnalyticsShoppingAssistantConfigurableBar = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
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
            DeprecatedChart={DEPRECATED_TotalSalesByProductComboChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

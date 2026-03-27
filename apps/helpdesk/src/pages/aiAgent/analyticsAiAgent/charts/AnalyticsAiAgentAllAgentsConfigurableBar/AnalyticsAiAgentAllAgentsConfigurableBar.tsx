import { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicAiAgentTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import { dynamicTotalSalesAmountQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import { dynamicAiAgentAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
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

import { DEPRECATED_AnalyticsOverviewAutomatedInteractionsComboChart } from './DEPRECATED_AnalyticsOverviewAutomatedInteractionsComboChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const ALL_AGENTS_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'AI Agent automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicAiAgentAutomationRateQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'aiAgentRole'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'aiAgentRole'],
    },
    {
        measure: 'totalSalesAmount',
        name: 'Total sales',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicTotalSalesAmountQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId'],
    },
    {
        measure: 'averageTimeSavedByAgent',
        name: 'Time saved by agents',
        metricFormat: 'duration' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicAiAgentTimeSavedQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'aiAgentRole'],
    },
]

export const AnalyticsAiAgentAllAgentsConfigurableBar = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const stores = useStoreIntegrations()
    const metrics = useMemo(
        () =>
            getBarChartGraphConfig(
                ALL_AGENTS_BAR_CHART_METRICS,
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
            DeprecatedChart={
                DEPRECATED_AnalyticsOverviewAutomatedInteractionsComboChart
            }
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

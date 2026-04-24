import { useMemo } from 'react'

import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicAllAgentsTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import { dynamicTotalSalesAmountQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import { dynamicAllAgentsAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
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
        queryFactory: dynamicAllAgentsAutomationRateQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
        dimensions: [
            'channel',
            'storeIntegrationId',
            'aiAgentRole',
            'aiIntentCustomField',
        ],
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
        queryFactory: dynamicAllAgentsTimeSavedQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId'],
    },
]

export const AnalyticsAiAgentAllAgentsConfigurableBar = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
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

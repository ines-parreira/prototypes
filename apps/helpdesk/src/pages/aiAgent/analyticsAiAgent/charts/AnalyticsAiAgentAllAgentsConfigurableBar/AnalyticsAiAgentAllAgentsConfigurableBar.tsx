import { useMemo } from 'react'

import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { dynamicAllAgentsTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import { dynamicConversionRateQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import { dynamicTotalSalesAmountQueryFactoryV2 } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import { dynamicAllAgentsAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type {
    ChartConfig,
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
        measure: 'totalSalesAmount',
        name: 'Revenue influenced',
        metricFormat: 'currency-precision-1' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicTotalSalesAmountQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId'],
    },
    {
        measure: 'medianTimeSavedByAgent',
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
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

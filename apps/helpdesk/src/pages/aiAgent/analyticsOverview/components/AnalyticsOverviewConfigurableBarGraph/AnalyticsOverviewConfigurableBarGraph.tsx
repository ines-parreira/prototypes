import { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
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

import { DEPRECATED_AutomationRateComboChart } from './DEPRECATED_AutomationRateComboChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const OVERVIEW_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomationRateQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
    },
]

export const AnalyticsOverviewConfigurableBarGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const stores = useStoreIntegrations()

    const metrics = useMemo(
        () =>
            getBarChartGraphConfig(
                OVERVIEW_BAR_CHART_METRICS,
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
            DeprecatedChart={DEPRECATED_AutomationRateComboChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

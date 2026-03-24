import { useMemo } from 'react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    dynamicOverallAutomatedInteractionsQueryFactoryV2,
    dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import {
    dynamicOverallAutomationRateQueryFactoryV2,
    dynamicOverallAutomationRateTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import {
    getLineChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_AutomationLineChart } from './DEPRECATED_AutomationLineChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const OVERVIEW_LINE_CHART_METRICS: LineChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicOverallAutomationRateQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicOverallAutomationRateTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'automationFeatureType',
        ],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicOverallAutomatedInteractionsQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2,
        dimensions: [
            'overall',
            'channel',
            'storeIntegrationId',
            'automationFeatureType',
        ],
    },
]

export const AnalyticsOverviewConfigurableLineGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()
    const stores = useStoreIntegrations()

    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                OVERVIEW_LINE_CHART_METRICS,
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
            DeprecatedChart={DEPRECATED_AutomationLineChart}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}

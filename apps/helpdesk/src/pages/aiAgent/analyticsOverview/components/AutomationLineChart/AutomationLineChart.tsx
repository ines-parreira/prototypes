import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { ConfigurableGraph } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    dynamicOverallAutomatedInteractionsQueryFactoryV2,
    dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import {
    dynamicOverallAutomationRateQueryFactoryV2,
    dynamicOverallAutomationRateTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_AutomationLineChart } from './DEPRECATED_AutomationLineChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

const AUTOMATION_LINE_CHART_METRICS: LineChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicOverallAutomationRateQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicOverallAutomationRateTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'automationFeatureType'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamicOverallAutomatedInteractionsQueryFactoryV2,
        timeSeriesQueryFactory:
            dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'automationFeatureType'],
    },
]

export const AutomationLineChart = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const isAnalyticsDashboardsNewChartsEnable = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
    )
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()
    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                AUTOMATION_LINE_CHART_METRICS,
                statsFilters,
                userTimezone,
                granularity,
            ),
        [statsFilters, userTimezone, granularity],
    )

    return isAnalyticsDashboardsNewChartsEnable ? (
        <ConfigurableGraph
            metrics={metrics}
            actionMenu={
                chartId && chartConfig ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={chartConfig.label}
                    />
                ) : undefined
            }
        />
    ) : (
        <DEPRECATED_AutomationLineChart />
    )
}

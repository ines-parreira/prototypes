import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { ConfigurableGraph } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import { dynamicOverallAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { getBarChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { BarChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_AutomationRateComboChart } from './DEPRECATED_AutomationRateComboChart'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

const AUTOMATION_RATE_BAR_CHART_METRICS: BarChartMetricConfig[] = [
    {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomationRateQueryFactoryV2,
        dimensions: ['channel', 'automationFeatureType'],
    },
    {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal' as const,
        interpretAs: 'more-is-better' as const,
        queryFactory: dynamicOverallAutomatedInteractionsQueryFactoryV2,
        dimensions: ['channel', 'automationFeatureType'],
    },
]

export const AutomationRateComboChart = ({
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const isAnalyticsDashboardsNewChartsEnable = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
    )
    const { statsFilters, userTimezone } = useAutomateFilters()
    const metrics = useMemo(
        () =>
            getBarChartGraphConfig(
                AUTOMATION_RATE_BAR_CHART_METRICS,
                statsFilters,
                userTimezone,
            ),
        [statsFilters, userTimezone],
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
        <DEPRECATED_AutomationRateComboChart />
    )
}

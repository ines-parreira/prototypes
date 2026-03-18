import type { ComponentType } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraph } from '@repo/reporting'

import { useSaveConfigurableGraphSelection } from 'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

import { useDashboardContext } from './DashboardContext'

type Props = {
    metrics: ConfigurableGraphMetricConfig[]
    analyticsChartId: string
    DeprecatedChart: ComponentType
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const ConfigurableGraphWrapper = ({
    metrics,
    analyticsChartId,
    DeprecatedChart,
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const isAnalyticsDashboardsNewChartsEnable = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
    )
    const dashboardContext = useDashboardContext()
    const { onSelect } = useSaveConfigurableGraphSelection({
        chartId: analyticsChartId,
        dashboardId: dashboardContext?.dashboardId,
        tabId: dashboardContext?.tabId,
        tabName: dashboardContext?.tabName,
        layoutConfig: dashboardContext?.layoutConfig ?? { sections: [] },
    })

    const savedItem = dashboardContext?.layoutConfig?.sections
        .flatMap((s) => s.items)
        .find((item) => item.chartId === analyticsChartId)

    return isAnalyticsDashboardsNewChartsEnable ? (
        <ConfigurableGraph
            // remount with the correct saved initialMeasure/initialDimension
            // if the managed dashboard API loads slower on refresh
            key={`${savedItem?.chartId}-${dashboardContext?.isLoaded ?? false}`}
            metrics={metrics}
            onSelect={onSelect}
            initialMeasure={savedItem?.measures?.[0]}
            initialDimension={savedItem?.dimensions?.[0]}
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
        <DeprecatedChart />
    )
}

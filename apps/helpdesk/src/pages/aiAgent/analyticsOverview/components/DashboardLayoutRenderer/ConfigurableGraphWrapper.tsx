import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraph } from '@repo/reporting'

import { useSaveConfigurableGraphSelection } from 'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useManagedDashboardContext } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/useManagedDashboardContext'

type Props = {
    metrics: ConfigurableGraphMetricConfig[]
    analyticsChartId: string
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const ConfigurableGraphWrapper = ({
    metrics,
    analyticsChartId,
    chartId,
    dashboard,
    chartConfig,
}: Props) => {
    const { value: isCustomDashboardsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
    )
    const dashboardContext = useManagedDashboardContext()
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

    return (
        <ConfigurableGraph
            // remount with the correct saved initialMeasure/initialDimension
            // if the managed dashboard API loads slower on refresh
            key={`${savedItem?.chartId}-${dashboardContext?.isLoaded ?? false}`}
            metrics={metrics}
            onSelect={onSelect}
            initialMeasure={savedItem?.measures?.[0]}
            initialDimension={savedItem?.dimensions?.[0]}
            actionMenu={
                isCustomDashboardsEnabled && chartId && chartConfig ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={chartConfig.label}
                    />
                ) : undefined
            }
        />
    )
}

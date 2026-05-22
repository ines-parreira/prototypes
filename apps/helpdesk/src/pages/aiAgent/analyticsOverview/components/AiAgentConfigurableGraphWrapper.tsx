import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraph } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

type Props = {
    metrics: ConfigurableGraphMetricConfig[]
    analyticsChartId: string
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export function AiAgentConfigurableGraphWrapper({
    metrics,
    analyticsChartId,
    chartId,
    dashboard,
    chartConfig,
}: Props) {
    const { value: enableCustomDashboards } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
    )

    const actionMenu =
        enableCustomDashboards && chartId && chartConfig ? (
            <ChartsActionMenu
                chartId={chartId}
                dashboard={dashboard}
                chartName={chartConfig.label}
            />
        ) : undefined

    return (
        <ConfigurableGraph
            metrics={metrics}
            analyticsChartId={analyticsChartId}
            actionMenu={actionMenu}
        />
    )
}

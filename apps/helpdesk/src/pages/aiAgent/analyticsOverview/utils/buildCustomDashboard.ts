import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const buildCustomDashboard = (
    name: string,
    layout: DashboardLayoutConfig,
    isFeatureFlagEnabled: boolean,
    isChartsEnabled = false,
): DashboardSchema => ({
    id: -1,
    name,
    analytics_filter_id: null,
    emoji: null,
    children: layout.sections
        .filter(
            (section) =>
                section.type === ChartType.Card ||
                section.type === ChartType.Table ||
                (section.type === ChartType.Graph && isChartsEnabled),
        )
        .map((section) => ({
            type: DashboardChildType.Section,
            children: section.items
                .filter(
                    (item) =>
                        item.visibility &&
                        (!item.requiresFeatureFlag || isFeatureFlagEnabled),
                )
                .map((item) => ({
                    type: DashboardChildType.Chart,
                    config_id: item.chartId,
                    metadata: {
                        savedMeasure: item.measures?.[0],
                        savedDimension: item.dimensions?.[0],
                    },
                })),
        })),
})

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
    isTablesFFEnabled = false,
): DashboardSchema => ({
    id: -1,
    name,
    analytics_filter_id: null,
    emoji: null,
    children: layout.sections
        .filter(
            (section) =>
                section.type === ChartType.Card ||
                section.type === ChartType.CardWithTimeseries ||
                (section.type === ChartType.Table && isTablesFFEnabled) ||
                (section.type === ChartType.Graph && isChartsEnabled),
        )
        .map((section) => ({
            type: DashboardChildType.Section,
            children: section.items
                .filter((item) => {
                    if (!item.requiresFeatureFlag) return true
                    return section.type === ChartType.Table
                        ? isTablesFFEnabled
                        : isFeatureFlagEnabled
                })
                .filter((item) =>
                    section.type === ChartType.Table ? true : item.visibility,
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

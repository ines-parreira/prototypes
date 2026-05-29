import type { DashboardLayoutConfig } from '@repo/reporting'
import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'

export const buildCustomDashboard = (
    name: string,
    layout: DashboardLayoutConfig,
): DashboardSchema => ({
    id: -1,
    name,
    analytics_filter_id: null,
    emoji: null,
    children: layout.sections.map((section) => ({
        type: DashboardChildType.Section,
        children: section.items
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

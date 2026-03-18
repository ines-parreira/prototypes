import { useCallback } from 'react'

import { useUpdateManagedDashboard } from 'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard'
import type {
    DashboardLayoutConfig,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type Params = {
    chartId: string
    dashboardId?: string
    tabId?: ManagedDashboardsTabId
    tabName?: string
    layoutConfig: DashboardLayoutConfig
}

type Selection = {
    measure: string
    dimension: string
}

export function useSaveConfigurableGraphSelection(params: Params): {
    onSelect: (selection: Selection) => void
} {
    const { chartId, dashboardId, tabId, tabName, layoutConfig } = params
    const { updateSection } = useUpdateManagedDashboard({ silent: true })

    const onSelect = useCallback(
        ({ measure, dimension }: Selection) => {
            if (!dashboardId || !tabId || !tabName) return

            const section = layoutConfig.sections.find((s) =>
                s.items.some((item) => item.chartId === chartId),
            )
            if (!section) return

            updateSection(
                dashboardId,
                tabId,
                tabName,
                layoutConfig,
                section.id,
                (s) => ({
                    ...s,
                    items: s.items.map((item) =>
                        item.chartId === chartId
                            ? {
                                  ...item,
                                  measures: [measure],
                                  dimensions: [dimension],
                              }
                            : item,
                    ),
                }),
            )
        },
        [chartId, dashboardId, tabId, tabName, layoutConfig, updateSection],
    )

    return { onSelect }
}

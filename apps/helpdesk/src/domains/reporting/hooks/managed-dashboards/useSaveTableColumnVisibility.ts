import { useCallback } from 'react'

import { useUpdateManagedDashboard } from 'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard'
import type {
    DashboardLayoutConfig,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type Params = {
    dashboardId: ManagedDashboardId
    tabId: ManagedDashboardsTabId
    tabName: string
    layoutConfig: DashboardLayoutConfig
}

export function useSaveTableColumnVisibility(params: Params): {
    saveVisibleColumns: (chartId: string, visibleColumns: string[]) => void
} {
    const { dashboardId, tabId, tabName, layoutConfig } = params
    const { updateSection } = useUpdateManagedDashboard({ silent: true })

    const saveVisibleColumns = useCallback(
        (chartId: string, visibleColumns: string[]) => {
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
                            ? { ...item, visibleColumns }
                            : item,
                    ),
                }),
            )
        },
        [dashboardId, tabId, tabName, layoutConfig, updateSection],
    )

    return { saveVisibleColumns }
}

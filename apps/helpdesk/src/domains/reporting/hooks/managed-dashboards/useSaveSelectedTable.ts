import { useCallback } from 'react'

import { useUpdateManagedDashboard } from 'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard'
import type {
    DashboardLayoutConfig,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type Params = {
    dashboardId?: string
    tabId?: ManagedDashboardsTabId
    tabName?: string
    layoutConfig: DashboardLayoutConfig
}

export function useSaveSelectedTable(params: Params): {
    onSelect: (chartId: string) => void
} {
    const { dashboardId, tabId, tabName, layoutConfig } = params
    const { updateSection } = useUpdateManagedDashboard({ silent: true })

    const onSelect = useCallback(
        (chartId: string) => {
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
                (currentSection) => ({
                    ...currentSection,
                    items: currentSection.items.map((item) => ({
                        ...item,
                        visibility: item.chartId === chartId,
                    })),
                }),
            )
        },
        [dashboardId, layoutConfig, tabId, tabName, updateSection],
    )

    return { onSelect }
}

import { useDashboardContext } from '@repo/reporting'

import type {
    DashboardLayoutConfig,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type ManagedDashboardContextValue = {
    dashboardId?: ManagedDashboardId
    tabId?: ManagedDashboardsTabId
    tabName?: string
    layoutConfig: DashboardLayoutConfig
    isLoaded: boolean
    saveVisibleColumns?: (chartId: string, visibleColumns: string[]) => void
}

export function useManagedDashboardContext(): ManagedDashboardContextValue | null {
    return useDashboardContext() as ManagedDashboardContextValue | null
}

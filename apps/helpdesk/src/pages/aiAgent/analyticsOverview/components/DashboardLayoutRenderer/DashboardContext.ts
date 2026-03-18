import { createContext, useContext } from 'react'

import type {
    DashboardLayoutConfig,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export type DashboardContextValue = {
    dashboardId: ManagedDashboardId
    tabId: ManagedDashboardsTabId
    tabName: string
    layoutConfig: DashboardLayoutConfig
    isLoaded: boolean
}

export const DashboardContext = createContext<DashboardContextValue | null>(
    null,
)

export function useDashboardContext(): DashboardContextValue | null {
    return useContext(DashboardContext)
}

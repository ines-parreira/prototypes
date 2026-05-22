import { createContext, useContext } from 'react'

import type { DashboardLayoutConfig } from '../components/ManagedDashboards/types'

export type DashboardContextValue = {
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig
    isLoaded: boolean
}

export const DashboardContext = createContext<DashboardContextValue | null>(
    null,
)

export function useDashboardContext(): DashboardContextValue | null {
    return useContext(DashboardContext)
}

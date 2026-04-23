import { createContext, useContext } from 'react'

type DashboardLayoutItem = {
    chartId: string
    visibleColumns?: string[] | null
    measures?: string[] | null
    dimensions?: string[] | null
}

type DashboardLayoutSection = {
    id: string
    type: 'card' | 'graph' | 'table'
    items: DashboardLayoutItem[]
}

export type DashboardLayoutConfig = {
    sections: DashboardLayoutSection[]
}

export type DashboardContextValue = {
    dashboardId?: string
    tabId?: string
    tabName?: string
    layoutConfig: DashboardLayoutConfig
    isLoaded: boolean
    saveVisibleColumns?: (chartId: string, visibleColumns: string[]) => void
}

export const DashboardContext = createContext<DashboardContextValue | null>(
    null,
)

export function useDashboardContext(): DashboardContextValue | null {
    return useContext(DashboardContext)
}

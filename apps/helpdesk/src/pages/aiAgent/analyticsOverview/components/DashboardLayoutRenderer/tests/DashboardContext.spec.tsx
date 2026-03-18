import type { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import {
    DashboardContext,
    useDashboardContext,
} from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext'
import type { DashboardContextValue } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const mockContextValue: DashboardContextValue = {
    dashboardId: ManagedDashboardId.AiAgentOverview,
    tabId: ManagedDashboardsTabId.Overview,
    tabName: 'Main',
    isLoaded: true,
    layoutConfig: {
        sections: [
            {
                id: 'section_graphs',
                type: ChartType.Graph,
                items: [],
            },
        ],
    },
}

describe('useDashboardContext', () => {
    it('returns null when used outside a DashboardContext.Provider', () => {
        const { result } = renderHook(() => useDashboardContext())

        expect(result.current).toBeNull()
    })

    it('returns the context value when used inside a DashboardContext.Provider', () => {
        const wrapper = ({ children }: { children: ReactNode }) => (
            <DashboardContext.Provider value={mockContextValue}>
                {children}
            </DashboardContext.Provider>
        )

        const { result } = renderHook(() => useDashboardContext(), { wrapper })

        expect(result.current).toEqual(mockContextValue)
    })

    it('returns updated value when context value changes', () => {
        let contextValue = mockContextValue
        const wrapper = ({ children }: { children: ReactNode }) => (
            <DashboardContext.Provider value={contextValue}>
                {children}
            </DashboardContext.Provider>
        )

        const { result, rerender } = renderHook(() => useDashboardContext(), {
            wrapper,
        })

        expect(result.current?.tabId).toBe(ManagedDashboardsTabId.Overview)

        contextValue = {
            ...mockContextValue,
            tabId: ManagedDashboardsTabId.AllAgents,
        }
        rerender()

        expect(result.current?.tabId).toBe(ManagedDashboardsTabId.AllAgents)
    })
})

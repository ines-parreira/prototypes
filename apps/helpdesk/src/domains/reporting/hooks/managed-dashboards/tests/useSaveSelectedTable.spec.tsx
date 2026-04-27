import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { useSaveSelectedTable } from 'domains/reporting/hooks/managed-dashboards/useSaveSelectedTable'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ManagedDashboardsTabId } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const mockUpdateSection = jest.fn()

jest.mock(
    'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard',
    () => ({
        useUpdateManagedDashboard: () => ({
            updateSection: mockUpdateSection,
            isLoading: false,
        }),
    }),
)

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return ({ children }: { children?: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const DASHBOARD_ID = 'ai-agent-overview'
const TAB_ID = ManagedDashboardsTabId.Overview
const TAB_NAME = 'Main'

const mockLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'section_tables',
            type: ChartType.Table,
            items: [
                {
                    chartId: 'table_1' as any,
                    gridSize: 12,
                    visibility: true,
                },
                {
                    chartId: 'table_2' as any,
                    gridSize: 12,
                    visibility: false,
                },
            ],
        },
    ],
}

beforeEach(() => {
    mockUpdateSection.mockClear()
})

describe('useSaveSelectedTable', () => {
    it('calls updateSection with the correct table section id', () => {
        const { result } = renderHook(
            () =>
                useSaveSelectedTable({
                    dashboardId: DASHBOARD_ID,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig: mockLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current.onSelect('table_2')
        })

        expect(mockUpdateSection).toHaveBeenCalledWith(
            DASHBOARD_ID,
            TAB_ID,
            TAB_NAME,
            mockLayoutConfig,
            'section_tables',
            expect.any(Function),
        )
    })

    it('marks only the selected table as selected', () => {
        const { result } = renderHook(
            () =>
                useSaveSelectedTable({
                    dashboardId: DASHBOARD_ID,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig: mockLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current.onSelect('table_2')
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][5]
        const updatedSection = sectionUpdater(mockLayoutConfig.sections[0])

        expect(updatedSection.items).toEqual([
            {
                chartId: 'table_1',
                gridSize: 12,
                visibility: false,
            },
            {
                chartId: 'table_2',
                gridSize: 12,
                visibility: true,
            },
        ])
    })

    it('does not call updateSection when required params are missing', () => {
        const { result } = renderHook(
            () =>
                useSaveSelectedTable({
                    dashboardId: undefined,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig: mockLayoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current.onSelect('table_2')
        })

        expect(mockUpdateSection).not.toHaveBeenCalled()
    })
})

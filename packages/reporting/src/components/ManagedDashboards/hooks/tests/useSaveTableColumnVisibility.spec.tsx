import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DashboardLayoutConfig } from '../../types'
import { ChartType } from '../../types'
import { useSaveTableColumnVisibility } from '../useSaveTableColumnVisibility'

const mockUpdateSection = vi.fn()

vi.mock('../useUpdateManagedDashboard', () => ({
    useUpdateManagedDashboard: () => ({
        updateSection: mockUpdateSection,
        isLoading: false,
    }),
}))

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

const CHART_ID = 'performance-table'
const OTHER_CHART_ID = 'intent-performance-table'
const DASHBOARD_ID = 'ai-agent-overview'
const TAB_ID = 'overview'
const TAB_NAME = 'Main'

const mockLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'section_tables',
            type: ChartType.Table,
            items: [
                {
                    chartId: CHART_ID,
                    gridSize: 12,
                    visibility: true,
                },
                {
                    chartId: OTHER_CHART_ID,
                    gridSize: 12,
                    visibility: true,
                },
            ],
        },
    ],
}

const defaultParams = {
    dashboardId: DASHBOARD_ID,
    tabId: TAB_ID,
    tabName: TAB_NAME,
    layoutConfig: mockLayoutConfig,
}

beforeEach(() => {
    mockUpdateSection.mockClear()
})

describe('useSaveTableColumnVisibility', () => {
    describe('when the chartId is found in a section', () => {
        it('calls updateSection with the correct sectionId', () => {
            const { result } = renderHook(
                () => useSaveTableColumnVisibility(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.saveVisibleColumns(CHART_ID, [
                    'feature',
                    'handovers',
                ])
            })

            expect(mockUpdateSection).toHaveBeenCalledTimes(1)
            expect(mockUpdateSection).toHaveBeenCalledWith(
                DASHBOARD_ID,
                TAB_ID,
                TAB_NAME,
                mockLayoutConfig,
                'section_tables',
                expect.any(Function),
            )
        })

        it('sets visibleColumns on the matching item only', () => {
            const { result } = renderHook(
                () => useSaveTableColumnVisibility(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.saveVisibleColumns(CHART_ID, [
                    'feature',
                    'handovers',
                ])
            })

            const sectionUpdater = mockUpdateSection.mock.calls[0][5]
            const updatedSection = sectionUpdater(mockLayoutConfig.sections[0])

            expect(updatedSection.items[0]).toEqual({
                chartId: CHART_ID,
                gridSize: 12,
                visibility: true,
                visibleColumns: ['feature', 'handovers'],
            })
        })

        it('does not modify other items in the section', () => {
            const { result } = renderHook(
                () => useSaveTableColumnVisibility(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.saveVisibleColumns(CHART_ID, ['feature'])
            })

            const sectionUpdater = mockUpdateSection.mock.calls[0][5]
            const updatedSection = sectionUpdater(mockLayoutConfig.sections[0])

            expect(updatedSection.items[1]).toEqual({
                chartId: OTHER_CHART_ID,
                gridSize: 12,
                visibility: true,
            })
        })
    })

    describe('when the chartId is not found in any section', () => {
        it('does not call updateSection', () => {
            const { result } = renderHook(
                () => useSaveTableColumnVisibility(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.saveVisibleColumns('nonexistent_chart', [
                    'feature',
                ])
            })

            expect(mockUpdateSection).not.toHaveBeenCalled()
        })
    })
})

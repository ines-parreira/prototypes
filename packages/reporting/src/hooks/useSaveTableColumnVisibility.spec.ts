import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useDashboardContext } from '../contexts/DashboardContext'
import { useSaveTableColumnVisibility } from './useSaveTableColumnVisibility'

const mockSaveVisibleColumns = vi.fn()

vi.mock('../contexts/DashboardContext', () => ({
    useDashboardContext: vi.fn(),
}))

const CHART_ID = 'performance_breakdown_table'

const mockContext = {
    layoutConfig: {
        sections: [
            {
                id: 'section_tables',
                type: 'table' as const,
                items: [
                    {
                        chartId: CHART_ID,
                        visibleColumns: ['feature', 'automationRate'],
                    },
                    {
                        chartId: 'other_chart',
                        visibleColumns: ['col1'],
                    },
                ],
            },
        ],
    },
    isLoaded: true,
    saveVisibleColumns: mockSaveVisibleColumns,
}

beforeEach(() => {
    mockSaveVisibleColumns.mockClear()
    vi.mocked(useDashboardContext).mockReturnValue(mockContext)
})

describe('useSaveTableColumnVisibility', () => {
    describe('defaultVisibleColumns', () => {
        it('returns the saved visible columns for the given chartId', () => {
            const { result } = renderHook(() =>
                useSaveTableColumnVisibility(CHART_ID),
            )

            expect(result.current.defaultVisibleColumns).toEqual([
                'feature',
                'automationRate',
            ])
        })

        it('returns undefined when chartId is not found in sections', () => {
            const { result } = renderHook(() =>
                useSaveTableColumnVisibility('nonexistent_chart'),
            )

            expect(result.current.defaultVisibleColumns).toBeUndefined()
        })

        it('returns undefined when context is null', () => {
            vi.mocked(useDashboardContext).mockReturnValue(null)

            const { result } = renderHook(() =>
                useSaveTableColumnVisibility(CHART_ID),
            )

            expect(result.current.defaultVisibleColumns).toBeUndefined()
        })

        it('returns undefined when visibleColumns is null', () => {
            vi.mocked(useDashboardContext).mockReturnValue({
                ...mockContext,
                layoutConfig: {
                    sections: [
                        {
                            id: 'section_tables',
                            type: 'table' as const,
                            items: [
                                { chartId: CHART_ID, visibleColumns: null },
                            ],
                        },
                    ],
                },
            })

            const { result } = renderHook(() =>
                useSaveTableColumnVisibility(CHART_ID),
            )

            expect(result.current.defaultVisibleColumns).toBeUndefined()
        })
    })

    describe('onSaveVisibleColumns', () => {
        it('calls context.saveVisibleColumns with the correct chartId and columns', () => {
            const { result } = renderHook(() =>
                useSaveTableColumnVisibility(CHART_ID),
            )

            act(() => {
                result.current.onSaveVisibleColumns(['feature', 'handovers'])
            })

            expect(mockSaveVisibleColumns).toHaveBeenCalledTimes(1)
            expect(mockSaveVisibleColumns).toHaveBeenCalledWith(CHART_ID, [
                'feature',
                'handovers',
            ])
        })

        it('is a no-op when context is null', () => {
            vi.mocked(useDashboardContext).mockReturnValue(null)

            const { result } = renderHook(() =>
                useSaveTableColumnVisibility(CHART_ID),
            )

            act(() => {
                result.current.onSaveVisibleColumns(['feature'])
            })

            expect(mockSaveVisibleColumns).not.toHaveBeenCalled()
        })
    })
})

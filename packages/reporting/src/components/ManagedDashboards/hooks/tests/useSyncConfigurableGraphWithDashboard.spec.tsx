import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ChartType } from '../../types'
import { useManagedDashboardContext } from '../useManagedDashboardContext'
import { useSyncConfigurableGraphWithDashboard } from '../useSyncConfigurableGraphWithDashboard'

const mockSaveSelection = vi.fn()

vi.mock('../useSaveConfigurableGraphSelection', () => ({
    useSaveConfigurableGraphSelection: () => ({
        onSelect: mockSaveSelection,
    }),
}))

vi.mock('../useManagedDashboardContext', () => ({
    useManagedDashboardContext: vi.fn(),
}))

const mockedUseManagedDashboardContext = vi.mocked(useManagedDashboardContext)

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

const CHART_ID = 'configurable_line_graph'

const contextWithSavedItem = {
    dashboardId: 'ai-agent-overview',
    tabId: 'overview',
    tabName: 'Main',
    isLoaded: true,
    layoutConfig: {
        sections: [
            {
                id: 'section_graphs',
                type: ChartType.Graph,
                items: [
                    {
                        chartId: CHART_ID,
                        gridSize: 6 as const,
                        visibility: true,
                        measures: ['saved_measure'],
                        dimensions: ['saved_dimension'],
                    },
                ],
            },
        ],
    },
}

beforeEach(() => {
    mockSaveSelection.mockClear()
    mockedUseManagedDashboardContext.mockReset()
    mockedUseManagedDashboardContext.mockReturnValue(null)
})

describe('useSyncConfigurableGraphWithDashboard', () => {
    describe('when context is unavailable', () => {
        it('returns the caller-provided initial values', () => {
            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        analyticsChartId: CHART_ID,
                        initialMeasure: 'caller_measure',
                        initialDimension: 'caller_dimension',
                    }),
                { wrapper: makeWrapper() },
            )

            expect(result.current.initialMeasure).toBe('caller_measure')
            expect(result.current.initialDimension).toBe('caller_dimension')
        })

        it('does not save when onSelect is called, but still invokes the caller callback', () => {
            const callerOnSelect = vi.fn()
            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        analyticsChartId: CHART_ID,
                        onSelect: callerOnSelect,
                    }),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'new_measure',
                    dimension: 'new_dimension',
                })
            })

            expect(mockSaveSelection).not.toHaveBeenCalled()
            expect(callerOnSelect).toHaveBeenCalledWith({
                measure: 'new_measure',
                dimension: 'new_dimension',
            })
        })
    })

    describe('when analyticsChartId is not provided', () => {
        it('returns the caller-provided initial values even when a context is present', () => {
            mockedUseManagedDashboardContext.mockReturnValue(
                contextWithSavedItem,
            )

            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        initialMeasure: 'caller_measure',
                        initialDimension: 'caller_dimension',
                    }),
                { wrapper: makeWrapper() },
            )

            expect(result.current.initialMeasure).toBe('caller_measure')
            expect(result.current.initialDimension).toBe('caller_dimension')
        })

        it('does not save when onSelect is called', () => {
            mockedUseManagedDashboardContext.mockReturnValue(
                contextWithSavedItem,
            )
            const callerOnSelect = vi.fn()

            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        onSelect: callerOnSelect,
                    }),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'm',
                    dimension: 'd',
                })
            })

            expect(mockSaveSelection).not.toHaveBeenCalled()
            expect(callerOnSelect).toHaveBeenCalledWith({
                measure: 'm',
                dimension: 'd',
            })
        })
    })

    describe('when context has a saved item for the chartId', () => {
        beforeEach(() => {
            mockedUseManagedDashboardContext.mockReturnValue(
                contextWithSavedItem,
            )
        })

        it('uses the saved measure and dimension as initial values', () => {
            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        analyticsChartId: CHART_ID,
                        initialMeasure: 'caller_measure',
                        initialDimension: 'caller_dimension',
                    }),
                { wrapper: makeWrapper() },
            )

            expect(result.current.initialMeasure).toBe('saved_measure')
            expect(result.current.initialDimension).toBe('saved_dimension')
        })

        it('saves the selection and invokes the caller callback on onSelect', () => {
            const callerOnSelect = vi.fn()
            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        analyticsChartId: CHART_ID,
                        onSelect: callerOnSelect,
                    }),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'new_measure',
                    dimension: 'new_dimension',
                })
            })

            expect(mockSaveSelection).toHaveBeenCalledWith({
                measure: 'new_measure',
                dimension: 'new_dimension',
            })
            expect(callerOnSelect).toHaveBeenCalledWith({
                measure: 'new_measure',
                dimension: 'new_dimension',
            })
        })

        it('changes the remountKey when isLoaded toggles', () => {
            mockedUseManagedDashboardContext.mockReturnValue({
                ...contextWithSavedItem,
                isLoaded: false,
            })

            const { result, rerender } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        analyticsChartId: CHART_ID,
                    }),
                { wrapper: makeWrapper() },
            )

            const keyBefore = result.current.remountKey

            mockedUseManagedDashboardContext.mockReturnValue({
                ...contextWithSavedItem,
                isLoaded: true,
            })
            rerender()

            expect(result.current.remountKey).not.toBe(keyBefore)
        })
    })

    describe('when context has no saved item for the chartId', () => {
        it('falls back to caller-provided initial values', () => {
            mockedUseManagedDashboardContext.mockReturnValue({
                ...contextWithSavedItem,
                layoutConfig: { sections: [] },
            })

            const { result } = renderHook(
                () =>
                    useSyncConfigurableGraphWithDashboard({
                        analyticsChartId: CHART_ID,
                        initialMeasure: 'caller_measure',
                        initialDimension: 'caller_dimension',
                    }),
                { wrapper: makeWrapper() },
            )

            expect(result.current.initialMeasure).toBe('caller_measure')
            expect(result.current.initialDimension).toBe('caller_dimension')
        })
    })
})

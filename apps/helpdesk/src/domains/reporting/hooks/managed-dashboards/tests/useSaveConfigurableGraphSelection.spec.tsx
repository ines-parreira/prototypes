import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { useSaveConfigurableGraphSelection } from 'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection'
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
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const CHART_ID = 'automation_rate_combo_chart'
const DASHBOARD_ID = 'ai-agent-overview'
const TAB_ID = ManagedDashboardsTabId.Overview
const TAB_NAME = 'Main'

const mockLayoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'section_graphs',
            type: ChartType.Graph,
            items: [
                {
                    chartId: CHART_ID as any,
                    gridSize: 6,
                    visibility: true,
                },
                {
                    chartId: 'other_chart' as any,
                    gridSize: 6,
                    visibility: true,
                },
            ],
        },
    ],
}

const defaultParams = {
    chartId: CHART_ID,
    dashboardId: DASHBOARD_ID,
    tabId: TAB_ID,
    tabName: TAB_NAME,
    layoutConfig: mockLayoutConfig,
}

beforeEach(() => {
    mockUpdateSection.mockClear()
})

describe('useSaveConfigurableGraphSelection', () => {
    describe('when the chartId is found in a section', () => {
        it('calls updateSection with the correct sectionId', () => {
            const { result } = renderHook(
                () => useSaveConfigurableGraphSelection(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'automation_rate',
                    dimension: 'day',
                })
            })

            expect(mockUpdateSection).toHaveBeenCalledTimes(1)
            expect(mockUpdateSection).toHaveBeenCalledWith(
                DASHBOARD_ID,
                TAB_ID,
                TAB_NAME,
                mockLayoutConfig,
                'section_graphs',
                expect.any(Function),
            )
        })

        it('sets measures and dimensions on the matching item only', () => {
            const { result } = renderHook(
                () => useSaveConfigurableGraphSelection(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'automation_rate',
                    dimension: 'week',
                })
            })

            const sectionUpdater = mockUpdateSection.mock.calls[0][5]
            const updatedSection = sectionUpdater(mockLayoutConfig.sections[0])

            expect(updatedSection.items[0]).toEqual({
                chartId: CHART_ID,
                gridSize: 6,
                visibility: true,
                measures: ['automation_rate'],
                dimensions: ['week'],
            })
        })

        it('does not modify other items in the section', () => {
            const { result } = renderHook(
                () => useSaveConfigurableGraphSelection(defaultParams),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'automation_rate',
                    dimension: 'day',
                })
            })

            const sectionUpdater = mockUpdateSection.mock.calls[0][5]
            const updatedSection = sectionUpdater(mockLayoutConfig.sections[0])

            expect(updatedSection.items[1]).toEqual({
                chartId: 'other_chart',
                gridSize: 6,
                visibility: true,
            })
        })
    })

    describe('when optional params are not provided', () => {
        it.each([
            { omit: 'dashboardId', params: { dashboardId: undefined } },
            { omit: 'tabId', params: { tabId: undefined } },
            { omit: 'tabName', params: { tabName: undefined } },
        ])(
            'does not call updateSection when $omit is missing',
            ({ params }) => {
                const { result } = renderHook(
                    () =>
                        useSaveConfigurableGraphSelection({
                            ...defaultParams,
                            ...params,
                        }),
                    { wrapper: makeWrapper() },
                )

                act(() => {
                    result.current.onSelect({
                        measure: 'automation_rate',
                        dimension: 'day',
                    })
                })

                expect(mockUpdateSection).not.toHaveBeenCalled()
            },
        )
    })

    describe('when the chartId is not found in any section', () => {
        it('does not call updateSection', () => {
            const layoutWithoutChart: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'section_kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId: 'some_other_chart' as any,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const { result } = renderHook(
                () =>
                    useSaveConfigurableGraphSelection({
                        ...defaultParams,
                        layoutConfig: layoutWithoutChart,
                    }),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'automation_rate',
                    dimension: 'day',
                })
            })

            expect(mockUpdateSection).not.toHaveBeenCalled()
        })

        it('is a no-op when sections array is empty', () => {
            const emptyLayout: DashboardLayoutConfig = { sections: [] }

            const { result } = renderHook(
                () =>
                    useSaveConfigurableGraphSelection({
                        ...defaultParams,
                        layoutConfig: emptyLayout,
                    }),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.onSelect({
                    measure: 'automation_rate',
                    dimension: 'day',
                })
            })

            expect(mockUpdateSection).not.toHaveBeenCalled()
        })
    })
})

import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DashboardLayoutConfig } from '../../types'
import { ChartType } from '../../types'
import { useUpdateLayoutSectionForChart } from '../useUpdateLayoutSectionForChart'

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

const DASHBOARD_ID = 'ai-agent-overview'
const TAB_ID = 'overview'
const TAB_NAME = 'Main'

const layoutConfig: DashboardLayoutConfig = {
    sections: [
        {
            id: 'section_kpis',
            type: ChartType.Card,
            items: [
                { chartId: 'kpi_a', gridSize: 3, visibility: true },
                { chartId: 'kpi_b', gridSize: 3, visibility: true },
            ],
        },
        {
            id: 'section_tables',
            type: ChartType.Table,
            items: [{ chartId: 'table_a', gridSize: 12, visibility: true }],
        },
    ],
}

const identityUpdater = vi.fn((section) => section)

beforeEach(() => {
    mockUpdateSection.mockClear()
    identityUpdater.mockClear()
})

describe('useUpdateLayoutSectionForChart', () => {
    it('locates the section containing the given chartId and forwards the updater', () => {
        const { result } = renderHook(
            () =>
                useUpdateLayoutSectionForChart({
                    dashboardId: DASHBOARD_ID,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current('table_a', identityUpdater)
        })

        expect(mockUpdateSection).toHaveBeenCalledTimes(1)
        expect(mockUpdateSection).toHaveBeenCalledWith(
            DASHBOARD_ID,
            TAB_ID,
            TAB_NAME,
            layoutConfig,
            'section_tables',
            identityUpdater,
        )
    })

    it('picks the correct section when multiple sections exist', () => {
        const { result } = renderHook(
            () =>
                useUpdateLayoutSectionForChart({
                    dashboardId: DASHBOARD_ID,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current('kpi_b', identityUpdater)
        })

        expect(mockUpdateSection).toHaveBeenCalledWith(
            DASHBOARD_ID,
            TAB_ID,
            TAB_NAME,
            layoutConfig,
            'section_kpis',
            identityUpdater,
        )
    })

    it('is a no-op when no section contains the chartId', () => {
        const { result } = renderHook(
            () =>
                useUpdateLayoutSectionForChart({
                    dashboardId: DASHBOARD_ID,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current('unknown_chart', identityUpdater)
        })

        expect(mockUpdateSection).not.toHaveBeenCalled()
    })

    it.each([
        { omit: 'dashboardId', params: { dashboardId: undefined } },
        { omit: 'tabId', params: { tabId: undefined } },
        { omit: 'tabName', params: { tabName: undefined } },
    ])('is a no-op when $omit is missing', ({ params }) => {
        const { result } = renderHook(
            () =>
                useUpdateLayoutSectionForChart({
                    dashboardId: DASHBOARD_ID,
                    tabId: TAB_ID,
                    tabName: TAB_NAME,
                    layoutConfig,
                    ...params,
                }),
            { wrapper: makeWrapper() },
        )

        act(() => {
            result.current('table_a', identityUpdater)
        })

        expect(mockUpdateSection).not.toHaveBeenCalled()
    })
})

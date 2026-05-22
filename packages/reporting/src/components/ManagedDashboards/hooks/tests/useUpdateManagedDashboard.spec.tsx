import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { MockInstance } from 'vitest'
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import {
    mockGetAnalyticsManagedDashboardResponse,
    mockUpdateAnalyticsManagedDashboardHandler,
} from '@gorgias/helpdesk-mocks'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import type { DashboardLayoutConfig, GridSize } from '../../types'
import { ChartType } from '../../types'
import { buildDashboardConfig } from '../../utils/managedDashboardMappers'
import {
    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
    MANAGED_DASHBOARD_SAVED_MESSAGE,
    managedDashboardKeys,
} from '../constants'
import { useUpdateManagedDashboard } from '../useUpdateManagedDashboard'

vi.mock('../../utils/managedDashboardMappers', () => ({
    buildDashboardConfig: vi.fn(),
}))

const TAB_OVERVIEW = 'overview'
const TAB_ALL_AGENTS = 'all-agents'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const mockDashboard: AnalyticsManagedDashboard = {
    ...mockGetAnalyticsManagedDashboardResponse(),
    id: 'ai-agent-overview',
    account_id: 1,
    user_id: 2,
    config: {
        id: 'ai-agent-overview',
        tabs: [{ id: TAB_OVERVIEW, name: 'Main', sections: [] }],
    },
    created_datetime: '2026-02-18T00:00:00Z',
    updated_datetime: '2026-02-18T00:00:00Z',
}

const mockConfig = mockDashboard.config

const mockLayoutConfig: DashboardLayoutConfig = {
    sections: [{ id: 'section_kpis', type: ChartType.Card, items: [] }],
}

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

function makeWrapperWithClient() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return {
        queryClient,
        wrapper: ({ children }: { children?: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    }
}

beforeEach(() => {
    vi.mocked(buildDashboardConfig).mockReturnValue(mockConfig)
})

describe('useUpdateManagedDashboard', () => {
    describe('successful update (PUT)', () => {
        it('should call updateAnalyticsManagedDashboard and dispatch success notification', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('should not dispatch success notification when silent is true', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const { result } = renderHook(
                () => useUpdateManagedDashboard({ silent: true }),
                { wrapper: makeWrapper() },
            )

            let mutationSettled = false
            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                    () => {
                        mutationSettled = true
                    },
                )
            })

            await waitFor(() => expect(mutationSettled).toBe(true))

            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
    })

    describe('cache invalidation', () => {
        it('should invalidate the list cache after a successful update', async () => {
            const { queryClient, wrapper } = makeWrapperWithClient()
            queryClient.invalidateQueries = vi.fn()

            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper,
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
            )
        })
    })

    describe('error handling', () => {
        let consoleErrorSpy: MockInstance

        beforeEach(() => {
            consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {})
        })

        afterEach(() => {
            consoleErrorSpy.mockRestore()
        })

        it('should dispatch error notification with API error message on failure', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Internal server error' } } as any,
                        { status: 500 },
                    ),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Internal server error',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('should dispatch error notification with API error message on 404', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json({ error: { msg: 'Not found' } } as any, {
                        status: 404,
                    }),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Not found',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('should dispatch generic error message for network failures', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(
                    async () => HttpResponse.error() as any,
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })

    describe('section targeting', () => {
        it('should only update the targeted section and leave others unchanged', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const twoSectionLayout: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'section_kpis',
                        type: ChartType.Card,
                        items: [],
                    },
                    {
                        id: 'section_graphs',
                        type: ChartType.Graph,
                        items: [],
                    },
                ],
            }

            const updatedItems = [
                {
                    chartId: 'chart_1',
                    gridSize: 3 as GridSize,
                    visibility: true,
                },
            ]
            const sectionUpdater = vi.fn(
                (section: DashboardLayoutConfig['sections'][number]) => ({
                    ...section,
                    items: updatedItems,
                }),
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    twoSectionLayout,
                    'section_kpis',
                    sectionUpdater,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')

            const configPassedToMapper =
                vi.mocked(buildDashboardConfig).mock.calls[0][3]

            const kpisSection = configPassedToMapper.sections.find(
                (s) => s.id === 'section_kpis',
            )
            const graphsSection = configPassedToMapper.sections.find(
                (s) => s.id === 'section_graphs',
            )

            expect(kpisSection?.items).toEqual(updatedItems)
            expect(graphsSection?.items).toEqual([])
        })
    })

    describe('cache reading', () => {
        it('should read matching dashboard config from list cache and pass it to buildDashboardConfig', async () => {
            const { queryClient, wrapper } = makeWrapperWithClient()

            queryClient.setQueryData(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
                { data: { data: [mockDashboard] } },
            )

            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper,
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-overview',
                    TAB_OVERVIEW,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')

            expect(vi.mocked(buildDashboardConfig)).toHaveBeenCalledWith(
                'ai-agent-overview',
                TAB_OVERVIEW,
                'Main',
                expect.any(Object),
                mockDashboard.config,
            )
        })

        it('should pass undefined to buildDashboardConfig when no matching dashboard found in cache', async () => {
            const { queryClient, wrapper } = makeWrapperWithClient()

            queryClient.setQueryData(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
                { data: { data: [mockDashboard] } },
            )

            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper,
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-analytics',
                    TAB_ALL_AGENTS,
                    'All Agents',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')

            expect(vi.mocked(buildDashboardConfig)).toHaveBeenCalledWith(
                'ai-agent-analytics',
                TAB_ALL_AGENTS,
                'All Agents',
                expect.any(Object),
                undefined,
            )
        })
    })

    describe('tab-aware saving', () => {
        it('should pass tabId and tabName to buildDashboardConfig', async () => {
            server.use(
                mockUpdateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard),
                ).handler,
            )

            const { result } = renderHook(() => useUpdateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.updateSection(
                    'ai-agent-analytics',
                    TAB_ALL_AGENTS,
                    'All Agents',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')

            expect(vi.mocked(buildDashboardConfig)).toHaveBeenCalledWith(
                'ai-agent-analytics',
                TAB_ALL_AGENTS,
                'All Agents',
                expect.any(Object),
                undefined,
            )
        })
    })
})

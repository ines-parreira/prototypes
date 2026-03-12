import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetAnalyticsManagedDashboardResponse,
    mockUpdateAnalyticsManagedDashboardHandler,
} from '@gorgias/helpdesk-mocks'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import {
    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
    MANAGED_DASHBOARD_SAVED_MESSAGE,
} from 'domains/reporting/hooks/managed-dashboards/useCreateManagedDashboard'
import {
    managedDashboardKeys,
    useUpdateManagedDashboard,
} from 'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { buildDashboardConfig } from 'domains/reporting/utils/managedDashboardMappers'
import { ManagedDashboardsTabId } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    GridSize,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

jest.mock('domains/reporting/utils/managedDashboardMappers', () => ({
    buildDashboardConfig: jest.fn(),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockedDispatch,
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    mockedDispatch.mockClear()
    jest.mocked(notify).mockClear()
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
        tabs: [
            { id: ManagedDashboardsTabId.Overview, name: 'Main', sections: [] },
        ],
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
    return ({ children }: { children: ReactNode }) => (
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
        wrapper: ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    }
}

beforeEach(() => {
    jest.mocked(buildDashboardConfig).mockReturnValue(mockConfig)
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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                })
            })
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
                    ManagedDashboardsTabId.Overview,
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

            expect(notify).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    status: NotificationStatus.Success,
                }),
            )
        })
    })

    describe('cache invalidation', () => {
        it('should invalidate the list cache after a successful update', async () => {
            const { queryClient, wrapper } = makeWrapperWithClient()
            queryClient.invalidateQueries = jest.fn()

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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                })
            })

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
            )
        })
    })

    describe('error handling', () => {
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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: 'Internal server error',
                })
            })
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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: 'Not found',
                })
            })
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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
                })
            })
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
                    { id: 'section_kpis', type: ChartType.Card, items: [] },
                    { id: 'section_graphs', type: ChartType.Graph, items: [] },
                ],
            }

            const updatedItems = [
                {
                    chartId: 'chart_1' as AnalyticsChartType,
                    gridSize: 3 as GridSize,
                    visibility: true,
                },
            ]
            const sectionUpdater = jest.fn(
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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    twoSectionLayout,
                    'section_kpis',
                    sectionUpdater,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                })
            })

            const configPassedToMapper =
                jest.mocked(buildDashboardConfig).mock.calls[0][3]

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
                    ManagedDashboardsTabId.Overview,
                    'Main',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                })
            })

            expect(jest.mocked(buildDashboardConfig)).toHaveBeenCalledWith(
                'ai-agent-overview',
                ManagedDashboardsTabId.Overview,
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
                    ManagedDashboardsTabId.AllAgents,
                    'All Agents',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                })
            })

            expect(jest.mocked(buildDashboardConfig)).toHaveBeenCalledWith(
                'ai-agent-analytics',
                ManagedDashboardsTabId.AllAgents,
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
                    ManagedDashboardsTabId.AllAgents,
                    'All Agents',
                    mockLayoutConfig,
                    'section_kpis',
                    (section) => section,
                )
            })

            await waitFor(() => {
                expect(notify).toHaveBeenCalledWith({
                    status: NotificationStatus.Success,
                    message: MANAGED_DASHBOARD_SAVED_MESSAGE,
                })
            })

            expect(jest.mocked(buildDashboardConfig)).toHaveBeenCalledWith(
                'ai-agent-analytics',
                ManagedDashboardsTabId.AllAgents,
                'All Agents',
                expect.any(Object),
                undefined,
            )
        })
    })
})

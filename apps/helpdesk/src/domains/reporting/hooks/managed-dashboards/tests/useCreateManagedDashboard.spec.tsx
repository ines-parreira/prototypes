import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateAnalyticsManagedDashboardHandler,
    mockGetAnalyticsManagedDashboardResponse,
} from '@gorgias/helpdesk-mocks'
import type { AnalyticsManagedDashboard } from '@gorgias/helpdesk-types'

import {
    MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
    MANAGED_DASHBOARD_SAVED_MESSAGE,
    managedDashboardKeys,
    useCreateManagedDashboard,
} from 'domains/reporting/hooks/managed-dashboards/useCreateManagedDashboard'

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
        tabs: [{ id: 'tab_main', name: 'Main', sections: [] }],
    },
    created_datetime: '2026-02-18T00:00:00Z',
    updated_datetime: '2026-02-18T00:00:00Z',
}

const mockConfig = mockDashboard.config

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

describe('useCreateManagedDashboard', () => {
    describe('successful create (POST)', () => {
        it('should call createAnalyticsManagedDashboard and show success toast', async () => {
            const mockCreate = mockCreateAnalyticsManagedDashboardHandler(
                async () => HttpResponse.json(mockDashboard, { status: 201 }),
            )
            server.use(mockCreate.handler)

            const { result } = renderHook(() => useCreateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            const waitForRequest = mockCreate.waitForRequest(server)

            act(() => {
                result.current.mutate({
                    data: { id: 'ai-agent-overview', config: mockConfig },
                })
            })

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    id: 'ai-agent-overview',
                    config: mockConfig,
                })
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'success')
        })

        it('should not show success toast when silent is true', async () => {
            server.use(
                mockCreateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard, { status: 201 }),
                ).handler,
            )

            const { result } = renderHook(
                () => useCreateManagedDashboard({ silent: true }),
                { wrapper: makeWrapper() },
            )

            act(() => {
                result.current.mutate({
                    data: { id: 'ai-agent-overview', config: mockConfig },
                })
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
    })

    describe('cache invalidation', () => {
        it('should invalidate the list cache after a successful create', async () => {
            const { queryClient, wrapper } = makeWrapperWithClient()
            queryClient.invalidateQueries = jest.fn()

            server.use(
                mockCreateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(mockDashboard, { status: 201 }),
                ).handler,
            )

            const { result } = renderHook(() => useCreateManagedDashboard(), {
                wrapper,
            })

            act(() => {
                result.current.mutate({
                    data: { id: 'ai-agent-overview', config: mockConfig },
                })
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
                managedDashboardKeys.listAnalyticsManagedDashboards(),
            )
        })
    })

    describe('error handling', () => {
        it('should show error toast with API error message on failure', async () => {
            server.use(
                mockCreateAnalyticsManagedDashboardHandler(async () =>
                    HttpResponse.json(
                        { error: { msg: 'Internal server error' } } as any,
                        { status: 500 },
                    ),
                ).handler,
            )

            const { result } = renderHook(() => useCreateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.mutate({
                    data: { id: 'ai-agent-overview', config: mockConfig },
                })
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            const toastEl = await screen.findByRole('status', {
                name: 'Internal server error',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('should show generic error toast for network failures', async () => {
            server.use(
                mockCreateAnalyticsManagedDashboardHandler(
                    async () => HttpResponse.error() as any,
                ).handler,
            )

            const { result } = renderHook(() => useCreateManagedDashboard(), {
                wrapper: makeWrapper(),
            })

            act(() => {
                result.current.mutate({
                    data: { id: 'ai-agent-overview', config: mockConfig },
                })
            })

            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            const toastEl = await screen.findByRole('status', {
                name: MANAGED_DASHBOARD_SAVE_FAILED_MESSAGE,
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })
    })
})

import type { ReactNode } from 'react'
import { appQueryClient } from '@repo/api-resources'
import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import { useAllViewsLoaded } from '../useAllViewsLoaded'

const publicView = mockView({
    id: 1,
    name: 'Public view',
    category: null,
})
const systemView = mockView({ id: 2, name: 'Inbox', category: 'system' })

const server = setupServer()

function wrapper({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={appQueryClient}>
            {children}
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    appQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useAllViewsLoaded', () => {
    it('loads both the all-views and system-views queries before reporting ready', async () => {
        const requestedCategories: Array<string | null> = []
        server.use(
            mockListViewsHandler(async ({ request }) => {
                const category = new URL(request.url).searchParams.get(
                    'category',
                )
                requestedCategories.push(category)
                return HttpResponse.json(
                    mockListViewsResponse({
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        data:
                            category === 'system' ? [systemView] : [publicView],
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => useAllViewsLoaded(), { wrapper })

        expect(result.current).toBe(false)

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
        expect(requestedCategories).toEqual(
            expect.arrayContaining([null, 'system']),
        )
    })

    it('stays false while the system-views query is still loading', async () => {
        let releaseSystemViews: (() => void) | undefined
        const systemViewsLoaded = new Promise<void>((resolve) => {
            releaseSystemViews = resolve
        })
        const requestedCategories: Array<string | null> = []
        server.use(
            mockListViewsHandler(async ({ request }) => {
                const category = new URL(request.url).searchParams.get(
                    'category',
                )
                requestedCategories.push(category)
                if (category === 'system') {
                    await systemViewsLoaded
                }
                return HttpResponse.json(
                    mockListViewsResponse({
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        data:
                            category === 'system' ? [systemView] : [publicView],
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => useAllViewsLoaded(), { wrapper })

        await waitFor(() => {
            expect(requestedCategories).toEqual(
                expect.arrayContaining([null, 'system']),
            )
        })
        expect(result.current).toBe(false)

        releaseSystemViews?.()

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})

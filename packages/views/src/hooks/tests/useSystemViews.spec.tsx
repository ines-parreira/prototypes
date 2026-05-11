import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import type { PublicViewsOrderingData } from '../../types'
import { useSystemViews } from '../useSystemViews'

const inboxView = mockView({ id: 1, name: 'Inbox', category: 'system' })
const unassignedView = mockView({
    id: 2,
    name: 'Unassigned',
    category: 'system',
})
const closedView = mockView({ id: 3, name: 'Closed', category: 'system' })
const trashView = mockView({ id: 4, name: 'Trash', category: 'system' })

const { mockOrdering } = vi.hoisted(() => {
    const mockOrdering: { current: PublicViewsOrderingData } = {
        current: {
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: {},
        },
    }
    return { mockOrdering }
})

vi.mock('../usePublicViewsOrdering', () => ({
    usePublicViewsOrdering: () => mockOrdering.current,
}))

const mockListViews = mockListViewsHandler(async () =>
    HttpResponse.json(
        mockListViewsResponse({
            meta: { next_cursor: null, prev_cursor: null, total_resources: 0 },
            data: [inboxView, unassignedView, closedView, trashView],
        }),
    ),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListViews.handler)
    mockOrdering.current = {
        views: {},
        views_top: {},
        views_bottom: {},
        view_sections: {},
    }
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useSystemViews', () => {
    it('returns empty array while loading', () => {
        const { result } = renderHook(() => useSystemViews())

        expect(result.current).toEqual([])
    })

    it('returns top views then bottom views with icons', async () => {
        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'Closed',
                'Trash',
            ])
            expect(result.current[0].icon).toBe('user-arrow')
            expect(result.current[2].icon).toBe('check-circle')
        })
    })

    it('sorts by ordering from the public views ordering', async () => {
        mockOrdering.current = {
            views: {},
            views_top: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
            views_bottom: {
                '3': { display_order: 2 },
                '4': { display_order: 1 },
            },
            view_sections: {},
        }

        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current.map((v) => v.id)).toEqual([2, 1, 4, 3])
        })
    })

    it('returns all system views in default order when no ordering is set', async () => {
        const allSystemView = mockView({ name: 'All', category: 'system' })
        const snoozedView = mockView({ name: 'Snoozed', category: 'system' })
        const closedV = mockView({ name: 'Closed', category: 'system' })
        const trashV = mockView({ name: 'Trash', category: 'system' })
        const spamView = mockView({ name: 'Spam', category: 'system' })

        server.use(
            mockListViewsHandler(async () =>
                HttpResponse.json(
                    mockListViewsResponse({
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        data: [
                            spamView,
                            trashV,
                            closedV,
                            snoozedView,
                            allSystemView,
                            unassignedView,
                            inboxView,
                        ],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'All',
                'Snoozed',
                'Closed',
                'Trash',
                'Spam',
            ])
        })
    })

    it('filters out views without a name', async () => {
        const namelessView = mockView({
            name: undefined,
            category: 'system',
        })
        server.use(
            mockListViewsHandler(async () =>
                HttpResponse.json(
                    mockListViewsResponse({
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        data: [inboxView, namelessView],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current).toHaveLength(1)
            expect(result.current[0].name).toBe('Inbox')
        })
    })
})

import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import { useSystemViews } from '../useSystemViews'

const inboxView = mockView({ id: 1, name: 'Inbox', category: 'system' })
const unassignedView = mockView({
    id: 2,
    name: 'Unassigned',
    category: 'system',
})
const allView = mockView({ id: 3, name: 'All', category: 'system' })

const mockListViews = mockListViewsHandler(async () =>
    HttpResponse.json(
        mockListViewsResponse({
            data: [inboxView, unassignedView, allView],
        }),
    ),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListViews.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useSystemViews', () => {
    it('returns an empty array while loading', () => {
        const { result } = renderHook(() => useSystemViews())

        expect(result.current).toEqual([])
    })

    it('returns system views with icons', async () => {
        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current).toEqual([
                expect.objectContaining({
                    id: 1,
                    name: 'Inbox',
                    icon: 'user-arrow',
                }),
                expect.objectContaining({
                    id: 2,
                    name: 'Unassigned',
                    icon: 'folder-remove',
                }),
                expect.objectContaining({
                    id: 3,
                    name: 'All',
                    icon: 'inbox',
                }),
            ])
        })
    })

    it('sets icon to null for unknown view names', async () => {
        const customView = mockView({
            id: 10,
            name: 'CustomSystem',
            category: 'system',
        })
        server.use(
            mockListViewsHandler(async () =>
                HttpResponse.json(
                    mockListViewsResponse({ data: [customView] }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current).toEqual([
                expect.objectContaining({
                    id: 10,
                    name: 'CustomSystem',
                    icon: null,
                }),
            ])
        })
    })

    it('filters out views without a name', async () => {
        const namelessView = mockView({
            id: 99,
            name: undefined,
            category: 'system',
        })
        server.use(
            mockListViewsHandler(async () =>
                HttpResponse.json(
                    mockListViewsResponse({
                        data: [inboxView, namelessView],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSystemViews())

        await waitFor(() => {
            expect(result.current).toHaveLength(1)
            expect(result.current[0]).toEqual(
                expect.objectContaining({ id: 1, name: 'Inbox' }),
            )
        })
    })
})

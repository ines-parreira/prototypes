import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import { clearViewsCount, viewsCountStore } from '../../store/viewsCountStore'
import { useActiveView } from '../useActiveView'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

const view1 = mockView({ id: 1, name: 'Open tickets' })
const view2 = mockView({ id: 2, name: 'Unassigned' })

const mockListViews = mockListViewsHandler(async () =>
    HttpResponse.json(
        mockListViewsResponse({
            data: [view1, view2],
            meta: { next_cursor: null, prev_cursor: null, total_resources: 2 },
        }),
    ),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListViews.handler)
    clearViewsCount()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useActiveView', () => {
    it('returns null when no view is active', async () => {
        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current).toBeNull()
        })
    })

    it('returns the active view when activeViewId matches', async () => {
        viewsCountStore.setState({ activeViewId: 2 })

        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current).toEqual(view2)
        })
    })

    it('returns null when activeViewId does not match any view', async () => {
        viewsCountStore.setState({ activeViewId: 999 })

        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current).toBeNull()
        })
    })
})

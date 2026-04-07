import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import {
    activeViewStore,
    clearActiveViewId,
    setActiveViewId,
} from '../../store/activeViewStore'
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
    HttpResponse.json(mockListViewsResponse({ data: [view1, view2] })),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListViews.handler)
    clearActiveViewId()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('setActiveViewId', () => {
    it('sets the active view ID on the store', () => {
        setActiveViewId(42)

        expect(activeViewStore.getState().activeViewId).toBe(42)
    })

    it('overwrites the previous value', () => {
        setActiveViewId(1)
        setActiveViewId(2)

        expect(activeViewStore.getState().activeViewId).toBe(2)
    })
})

describe('clearActiveViewId', () => {
    it('resets the active view ID to null', () => {
        setActiveViewId(42)

        clearActiveViewId()

        expect(activeViewStore.getState().activeViewId).toBeNull()
    })
})

describe('useActiveView', () => {
    it('returns null when no active view is set', async () => {
        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current).toBeNull()
        })
    })

    it('returns the matching view when active view ID is set', async () => {
        setActiveViewId(2)

        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current?.id).toBe(2)
        })
    })

    it('returns null when the active view ID does not match any view', async () => {
        setActiveViewId(999)

        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current).toBeNull()
        })
    })

    it('reacts to active view ID changes', async () => {
        const { result } = renderHook(() => useActiveView())

        await waitFor(() => {
            expect(result.current).toBeNull()
        })

        act(() => {
            setActiveViewId(1)
        })

        await waitFor(() => {
            expect(result.current?.id).toBe(1)
        })
    })

    it('syncs active view ID from the URL on /app/views/:viewId routes', async () => {
        const { result } = renderHook(() => useActiveView(), {
            initialEntries: ['/app/views/1'],
            path: '/app/views/:viewId',
        })

        await waitFor(() => {
            expect(result.current?.id).toBe(1)
        })

        expect(activeViewStore.getState().activeViewId).toBe(1)
    })
})

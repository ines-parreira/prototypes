import { renderHook } from '@repo/testing/vitest'

import { activeViewStore, clearActiveViewId } from '../../store/activeViewStore'
import { useActiveViewUrlSync } from '../useActiveViewUrlSync'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

beforeEach(() => {
    clearActiveViewId()
})

describe('useActiveViewUrlSync', () => {
    it('syncs viewId from /app/views/:viewId', () => {
        renderHook(() => useActiveViewUrlSync(), {
            initialEntries: ['/app/views/42'],
            path: '/app/views/:viewId',
        })

        expect(activeViewStore.getState().activeViewId).toBe(42)
    })

    it('syncs viewId from /app/views/:viewId/:ticketId', () => {
        renderHook(() => useActiveViewUrlSync(), {
            initialEntries: ['/app/views/7/123'],
            path: '/app/views/:viewId/:ticketId',
        })

        expect(activeViewStore.getState().activeViewId).toBe(7)
    })

    it('syncs viewId from /app/tickets/:viewId/:viewSlug?', () => {
        renderHook(() => useActiveViewUrlSync(), {
            initialEntries: ['/app/tickets/15/open-tickets'],
            path: '/app/tickets/:viewId/:viewSlug?',
        })

        expect(activeViewStore.getState().activeViewId).toBe(15)
    })

    it('does not set activeViewId when viewId is not in params', () => {
        renderHook(() => useActiveViewUrlSync(), {
            initialEntries: ['/app/settings'],
            path: '/app/settings',
        })

        expect(activeViewStore.getState().activeViewId).toBeNull()
    })

    it('does not set activeViewId when viewId is not a number', () => {
        renderHook(() => useActiveViewUrlSync(), {
            initialEntries: ['/app/views/abc'],
            path: '/app/views/:viewId',
        })

        expect(activeViewStore.getState().activeViewId).toBeNull()
    })
})

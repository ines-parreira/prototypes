import { renderHook } from '@testing-library/react'

import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    clearViewsCount,
    getViewCount,
    getViewCountEntry,
    markViewAsViewed,
    setNextTickAt,
    setViewsCount,
    useViewCount,
    viewsCountStore,
} from '../viewsCountStore'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

function setSystemViews(views: View[]): void {
    appQueryClient.setQueryData(
        queryKeys.views.listAllViews({ limit: 100, category: 'system' }),
        {
            pages: [
                {
                    data: {
                        data: views,
                    },
                },
            ],
            pageParams: [undefined],
        },
    )
}

beforeEach(() => {
    appQueryClient.clear()
    clearViewsCount()
})

describe('setViewsCount', () => {
    it('sets counts with a lastFetchedAt timestamp', () => {
        setViewsCount({ 1: 10, 2: 20 })

        const { counts } = viewsCountStore.getState()
        expect(counts[1]).toEqual({
            count: 10,
            lastFetchedAt: expect.any(String),
        })
        expect(counts[2]?.count).toBe(20)
    })

    it('merges incoming counts onto existing entries', () => {
        setViewsCount({ 1: 10 })
        setViewsCount({ 2: 20 })

        const { counts } = viewsCountStore.getState()
        expect(counts[1]?.count).toBe(10)
        expect(counts[2]?.count).toBe(20)
    })

    it('overwrites the count for an existing view', () => {
        setViewsCount({ 1: 10 })
        setViewsCount({ 1: 42 })

        expect(viewsCountStore.getState().counts[1]?.count).toBe(42)
    })
})

describe('getViewCount / getViewCountEntry', () => {
    it('returns the count for a known view', () => {
        setViewsCount({ 1: 10 })

        expect(getViewCount(1)).toBe(10)
        expect(getViewCountEntry(1)?.count).toBe(10)
    })

    it('returns undefined for an unknown view', () => {
        expect(getViewCount(999)).toBeUndefined()
        expect(getViewCountEntry(999)).toBeUndefined()
    })
})

describe('useViewCount', () => {
    it('subscribes to the count for a single view', () => {
        setViewsCount({ 1: 42 })

        const { result } = renderHook(() => useViewCount(1))

        expect(result.current).toBe(42)
    })

    it('returns undefined when the view has no count yet', () => {
        const { result } = renderHook(() => useViewCount(999))

        expect(result.current).toBeUndefined()
    })
})

describe('markViewAsViewed', () => {
    it('adds the view to the LRU recent set with a timestamp', () => {
        markViewAsViewed(42)

        const entry = viewsCountStore.getState().recent[42]
        expect(entry?.viewedAt).toEqual(expect.any(String))
    })

    it('overwrites the timestamp on a subsequent activation', () => {
        vi.useFakeTimers()
        try {
            vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))
            markViewAsViewed(1)
            const first = viewsCountStore.getState().recent[1]?.viewedAt

            vi.setSystemTime(new Date('2025-01-01T00:00:01.000Z'))
            markViewAsViewed(1)
            const second = viewsCountStore.getState().recent[1]?.viewedAt

            expect(second).not.toBe(first)
        } finally {
            vi.useRealTimers()
        }
    })
})

describe('setNextTickAt', () => {
    it('round-trips through the store', () => {
        setNextTickAt(1234)

        expect(viewsCountStore.getState().nextTickAt).toBe(1234)
    })
})

describe('URL watcher', () => {
    // `startUrlWatcher` monkey-patches `history.pushState`/`replaceState` and
    // listens for `popstate` during hydration. Once hydrated, every URL
    // change should run `syncViewedFromUrl`, which marks the URL's view
    // (e.g. `/app/views/42`) as viewed in the LRU.
    beforeEach(() => {
        // Some other test in this file may have left a view in the recent
        // set; reset both sides so we observe the URL effect cleanly.
        viewsCountStore.setState({ recent: {} })
    })

    it('marks the URL view as viewed when pushState navigates to /app/views/:id', () => {
        history.pushState({}, '', '/app/views/42')

        expect(viewsCountStore.getState().recent[42]).toBeDefined()
    })

    it('marks the URL view as viewed when replaceState navigates', () => {
        history.replaceState({}, '', '/app/views/77')

        expect(viewsCountStore.getState().recent[77]).toBeDefined()
    })

    it('marks the Inbox view as viewed when navigating to /app/views', () => {
        setSystemViews([{ id: 5, name: 'Inbox' } as View])

        history.pushState({}, '', '/app/views')

        expect(viewsCountStore.getState().recent[5]).toBeDefined()
    })

    it.each(['/app', '/app/', '/app/tickets', '/app/tickets/'])(
        'does not assume %s is the Inbox view',
        (path) => {
            setSystemViews([{ id: 5, name: 'Inbox' } as View])

            history.pushState({}, '', path)

            expect(viewsCountStore.getState().recent).toEqual({})
        },
    )

    it('does not mark anything when navigating to a non-view URL', () => {
        history.pushState({}, '', '/app/customers')

        expect(viewsCountStore.getState().recent).toEqual({})
    })
})

describe('clearViewsCount', () => {
    it('resets counts, recent, leader state, and nextTickAt', () => {
        setViewsCount({ 1: 10 })
        markViewAsViewed(1)
        viewsCountStore.setState({ isLeader: true })
        setNextTickAt(1234)

        clearViewsCount()

        expect(viewsCountStore.getState()).toMatchObject({
            counts: {},
            recent: {},
            isLeader: false,
            nextTickAt: null,
        })
    })
})

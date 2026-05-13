import { renderHook, waitFor } from '@testing-library/react'

import {
    clearViewsCount,
    collapseSection,
    expandSection,
    getActiveViewId,
    getExpandedSectionIds,
    getViewCount,
    getViewCountEntry,
    getViewportViewIds,
    markViewAsViewed,
    setActiveViewFallback,
    setScores,
    setViewportViewIds,
    setViewsCount,
    useViewCount,
    viewsCountStore,
} from '../viewsCountStore'
import { clearViewsCountV3, viewsCountStoreV3 } from '../viewsCountStoreV3'

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
    clearViewsCount()
    clearViewsCountV3()
    Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true,
    })
})

describe('setViewsCount', () => {
    it('sets counts on the store', () => {
        setViewsCount({ 1: 10, 2: 20 })

        const { counts } = viewsCountStore.getState()
        expect(counts[1]).toEqual({
            count: 10,
            lastFetchedAt: expect.any(String),

            lastViewedAt: null,
        })
        expect(counts[2]).toEqual({
            count: 20,
            lastFetchedAt: expect.any(String),

            lastViewedAt: null,
        })
    })

    it('merges with existing counts', () => {
        setViewsCount({ 1: 10 })
        setViewsCount({ 2: 20 })

        const { counts } = viewsCountStore.getState()
        expect(counts[1]?.count).toBe(10)
        expect(counts[2]?.count).toBe(20)
    })

    it('overwrites existing counts for the same view', () => {
        setViewsCount({ 1: 10 })
        setViewsCount({ 1: 42 })

        expect(viewsCountStore.getState().counts[1]?.count).toBe(42)
    })

    it('sets lastFetchedAt timestamp on each entry', () => {
        const before = new Date().toISOString()
        setViewsCount({ 1: 10 })
        const after = new Date().toISOString()

        const entry = viewsCountStore.getState().counts[1]
        expect(entry?.lastFetchedAt).toBeDefined()
        expect(entry!.lastFetchedAt >= before).toBe(true)
        expect(entry!.lastFetchedAt <= after).toBe(true)
    })
})

describe('useViewCount', () => {
    it('returns undefined when no count exists for the view', () => {
        const { result } = renderHook(() => useViewCount(999))

        expect(result.current).toBeUndefined()
    })

    it('returns the count for a given view', () => {
        setViewsCount({ 5: 50 })

        const { result } = renderHook(() => useViewCount(5))

        expect(result.current).toBe(50)
    })

    it('reacts to count updates', async () => {
        const { result } = renderHook(() => useViewCount(3))

        expect(result.current).toBeUndefined()

        setViewsCount({ 3: 30 })

        await waitFor(() => {
            expect(result.current).toBe(30)
        })
    })

    it('returns zero for a zero count', () => {
        setViewsCount({ 7: 0 })

        const { result } = renderHook(() => useViewCount(7))

        expect(result.current).toBe(0)
    })
})

describe('getViewCount', () => {
    it('returns undefined when no count exists', () => {
        expect(getViewCount(999)).toBeUndefined()
    })

    it('returns the count for a given view', () => {
        setViewsCount({ 5: 50 })

        expect(getViewCount(5)).toBe(50)
    })

    it('returns zero for a zero count', () => {
        setViewsCount({ 7: 0 })

        expect(getViewCount(7)).toBe(0)
    })
})

describe('getViewCountEntry', () => {
    it('returns undefined when no entry exists', () => {
        expect(getViewCountEntry(999)).toBeUndefined()
    })

    it('returns the full entry for a given view', () => {
        setViewsCount({ 5: 50 })

        const entry = getViewCountEntry(5)
        expect(entry).toEqual({
            count: 50,
            lastFetchedAt: expect.any(String),

            lastViewedAt: null,
        })
    })
})

describe('clearViewsCount', () => {
    it('clears all counts', () => {
        setViewsCount({ 1: 10, 2: 20 })

        clearViewsCount()

        expect(viewsCountStore.getState().counts).toEqual({})
    })
})

describe('markViewAsViewed', () => {
    it('stamps lastViewedAt on an existing entry', () => {
        setViewsCount({ 1: 10 })

        markViewAsViewed(1)

        expect(viewsCountStore.getState().counts[1]?.lastViewedAt).toEqual(
            expect.any(String),
        )
    })

    it('does nothing when the entry does not exist', () => {
        markViewAsViewed(999)

        expect(viewsCountStore.getState().counts[999]).toBeUndefined()
    })
})

describe('collapseSection', () => {
    it('removes the section from expandedSectionIds', () => {
        expandSection('section-1')
        expandSection('section-2')

        collapseSection('section-1')

        expect(viewsCountStore.getState().expandedSectionIds).toEqual([
            'section-2',
        ])
    })

    it('does nothing when the section is not expanded', () => {
        viewsCountStore.setState({ expandedSectionIds: ['section-1'] })

        collapseSection('section-99')

        expect(viewsCountStore.getState().expandedSectionIds).toEqual([
            'section-1',
        ])
    })
})

describe('expandSection', () => {
    it('is a no-op when the section is already expanded', () => {
        expandSection('section-1')

        expandSection('section-1')

        expect(viewsCountStore.getState().expandedSectionIds).toEqual([
            'section-1',
        ])
    })
})

describe('url watcher', () => {
    it('syncs activeViewId on history.pushState', () => {
        Object.defineProperty(window, 'location', {
            value: { pathname: '/views/42' },
            writable: true,
        })

        history.pushState({}, '', '/views/42')

        expect(viewsCountStore.getState().activeViewId).toBe(42)
    })

    it('syncs activeViewId on history.replaceState', () => {
        Object.defineProperty(window, 'location', {
            value: { pathname: '/views/99' },
            writable: true,
        })

        history.replaceState({}, '', '/views/99')

        expect(viewsCountStore.getState().activeViewId).toBe(99)
    })

    it('marks view as viewed when navigating to a view URL', () => {
        setViewsCount({ 42: 10 })
        Object.defineProperty(window, 'location', {
            value: { pathname: '/views/42' },
            writable: true,
        })

        history.pushState({}, '', '/views/42')

        expect(viewsCountStore.getState().counts[42]?.lastViewedAt).toEqual(
            expect.any(String),
        )
    })

    it('sets activeViewId to null for non-view URLs', () => {
        viewsCountStore.setState({ activeViewId: 1 })
        Object.defineProperty(window, 'location', {
            value: { pathname: '/settings' },
            writable: true,
        })

        history.pushState({}, '', '/settings')

        expect(viewsCountStore.getState().activeViewId).toBeNull()
    })
})

describe('viewsCountStore persistence', () => {
    it('can clear persisted storage', async () => {
        setViewsCount({ 1: 10 })

        await viewsCountStore.persist.clearStorage()

        expect(viewsCountStore.getState().counts[1]?.count).toBe(10)
    })
})

describe('getActiveViewId', () => {
    it('returns null when no view is active', () => {
        expect(getActiveViewId()).toBeNull()
    })

    it('returns the active view ID', () => {
        viewsCountStore.setState({ activeViewId: 42 })

        expect(getActiveViewId()).toBe(42)
    })
})

describe('getExpandedSectionIds', () => {
    it('returns undefined when no sections have been set', () => {
        expect(getExpandedSectionIds()).toBeUndefined()
    })

    it('returns the expanded section IDs', () => {
        viewsCountStore.setState({
            expandedSectionIds: ['public', 'section-1'],
        })

        expect(getExpandedSectionIds()).toEqual(['public', 'section-1'])
    })
})

describe('setScores', () => {
    it('sets scores on the store', () => {
        setScores({ 1: 100, 2: 200 })

        expect(viewsCountStore.getState().scores).toEqual({ 1: 100, 2: 200 })
    })

    it('replaces previous scores', () => {
        setScores({ 1: 100 })
        setScores({ 2: 200 })

        expect(viewsCountStore.getState().scores).toEqual({ 2: 200 })
    })
})

describe('setViewportViewIds', () => {
    it('replaces the viewport list', () => {
        setViewportViewIds([1, 2, 3])

        expect(getViewportViewIds()).toEqual([1, 2, 3])
    })

    it('overwrites prior values', () => {
        setViewportViewIds([1, 2])
        setViewportViewIds([3])

        expect(getViewportViewIds()).toEqual([3])
    })
})

describe('getViewportViewIds', () => {
    it('returns empty array by default', () => {
        expect(getViewportViewIds()).toEqual([])
    })
})

describe('setActiveViewFallback on inbox-root URLs', () => {
    it.each(['/app', '/app/', '/app/views', '/app/views/', '/app/tickets'])(
        'marks the fallback as viewed when the URL is %s',
        (pathname) => {
            window.location.pathname = pathname
            setViewsCount({ 42: 5 })

            setActiveViewFallback(42)

            expect(viewsCountStore.getState().counts[42]?.lastViewedAt).toEqual(
                expect.any(String),
            )
            expect(viewsCountStoreV3.getState().recent[42]).toEqual({
                viewedAt: expect.any(String),
            })
        },
    )

    it('does not mark the fallback when the URL is /app/settings', () => {
        window.location.pathname = '/app/settings'

        setActiveViewFallback(42)

        expect(viewsCountStoreV3.getState().recent[42]).toBeUndefined()
    })

    it('does not mark anything when the URL has an explicit view ID', () => {
        window.location.pathname = '/app/tickets/999'

        setActiveViewFallback(42)

        expect(viewsCountStoreV3.getState().recent[42]).toBeUndefined()
    })

    it('does not mark when the fallback is cleared', () => {
        window.location.pathname = '/app'

        setActiveViewFallback(null)

        expect(viewsCountStoreV3.getState().recent).toEqual({})
    })
})

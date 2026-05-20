import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    clearViewsCount,
    markViewAsViewed,
    setViewsCount,
    viewsCountStore,
} from '../../store/viewsCountStore'
import { createScheduler } from '../scheduler'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

function makeView(id: number): View {
    return { id, name: `View ${id}` } as View
}

function setAllViews(views: View[]): void {
    appQueryClient.setQueryData(queryKeys.views.listAllViews({ limit: 100 }), {
        pages: [
            {
                data: {
                    data: views,
                },
            },
        ],
        pageParams: [undefined],
    })
}

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

/**
 * Bumps the fake clock by 1 ms before each call so successive
 * `markViewAsViewed` invocations produce distinct timestamps and a
 * deterministic LRU order.
 */
function markViewed(viewId: number): void {
    vi.advanceTimersByTime(1)
    markViewAsViewed(viewId)
}

/**
 * Drains queued microtasks. `becomeLeader` awaits hydration before
 * scanning views — a single Promise.resolve hop is not enough to settle
 * the async continuation in all cases.
 */
async function flushMicrotasks(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await new Promise<void>((resolve) => queueMicrotask(resolve))
    }
}

beforeEach(() => {
    appQueryClient.clear()
    clearViewsCount()
    vi.useFakeTimers()
    window.history.pushState({}, '', '/')
})

afterEach(() => {
    vi.useRealTimers()
})

describe('tick', () => {
    it('emits expired recent view IDs', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1), makeView(2)])
        setViewsCount({ 1: 50, 2: 60 })
        markViewed(1)
        markViewed(2)

        vi.advanceTimersByTime(31_000) // past default 30 s TTL
        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith(expect.arrayContaining([1, 2]))
    })

    it('skips views still inside the TTL window', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 50 })
        markViewed(1)

        vi.advanceTimersByTime(10_000)
        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('always emits views with no lastFetchedAt', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1)])
        markViewed(1) // no setViewsCount → no entry in viewsCountStore.counts

        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith([1])
    })

    it('uses per-count TTL: large views age out slower than small ones', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1), makeView(2)])
        // View 1: 50 tickets → 30 s TTL. View 2: 1000 tickets → 600 s TTL.
        setViewsCount({ 1: 50, 2: 1000 })
        markViewed(1)
        markViewed(2)

        // Past view 1's TTL, well within view 2's.
        vi.advanceTimersByTime(60_000)

        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith([1])
    })

    it('uses the active view TTL override only for the URL-active view', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({
            onRefresh,
            config: { activeViewTtlSeconds: 0 },
        })

        setAllViews([makeView(1), makeView(2)])
        setViewsCount({ 1: 50, 2: 50 })
        markViewed(1)
        markViewed(2)
        window.history.pushState({}, '', '/app/views/1')

        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith([1])
    })

    it('defaults the active URL view TTL to 30 s when no override is configured', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1), makeView(2)])
        setViewsCount({ 1: 1000, 2: 1000 })
        markViewed(1)
        markViewed(2)
        window.history.pushState({}, '', '/app/views/1')

        vi.advanceTimersByTime(31_000)
        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith([1])
    })

    it('treats the /app/views inbox URL as the active Inbox view', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({
            onRefresh,
            config: { activeViewTtlSeconds: 0 },
        })

        setSystemViews([{ id: 10, name: 'Inbox' } as View])
        setViewsCount({ 10: 1000 })
        window.history.pushState({}, '', '/app/views')

        scheduler.tick()

        expect(viewsCountStore.getState().recent[10]).toBeDefined()
        expect(onRefresh).toHaveBeenCalledWith([10])
    })

    it('refreshes a 100-count view after 60 s (1 min per 100 tickets)', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 100 })
        markViewed(1)

        // Just under the 60 s TTL — should not fire.
        vi.advanceTimersByTime(55_000)
        scheduler.tick()
        expect(onRefresh).not.toHaveBeenCalled()

        // Past 60 s — should fire.
        vi.advanceTimersByTime(10_000)
        scheduler.tick()
        expect(onRefresh).toHaveBeenCalledWith([1])
    })

    it('caps the recent pool at maxRecentViews (V3 order)', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({
            onRefresh,
            config: { maxRecentViews: 2 },
        })

        const ids = [1, 2, 3, 4]
        setAllViews(ids.map(makeView))
        for (const id of ids) markViewed(id)

        scheduler.tick()

        const [emitted] = onRefresh.mock.calls[0] as [number[]]
        expect(emitted.sort()).toEqual([3, 4])
    })

    it('skips refresh when shouldRefresh returns false', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({
            onRefresh,
            shouldRefresh: () => false,
        })

        setAllViews([makeView(1)])
        markViewed(1)

        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('does nothing when the recent pool is empty', () => {
        const onRefresh = vi.fn()
        const scheduler = createScheduler({ onRefresh })

        setAllViews([makeView(1)])

        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('stamps nextTickAt on each tick', () => {
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            config: { tickIntervalSeconds: 7 },
        })

        const before = Date.now()
        scheduler.tick()

        const stamped = viewsCountStore.getState().nextTickAt
        expect(stamped).not.toBeNull()
        expect((stamped ?? 0) - before).toBeGreaterThanOrEqual(7_000)
    })
})

describe('takeover stale-view scan', () => {
    it('dispatches every view on first takeover when counts are empty', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1), makeView(2), makeView(3)])

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(onFetchAll).toHaveBeenCalledWith([1, 2, 3])
    })

    it('excludes deactivated views from the takeover dispatch', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([
            makeView(1),
            { ...makeView(2), deactivated_datetime: '2024-01-01T00:00:00Z' },
            makeView(3),
        ])

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(onFetchAll).toHaveBeenCalledWith([1, 3])
    })

    it('does not dispatch at all when every view is deactivated', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([
            { ...makeView(1), deactivated_datetime: '2024-01-01T00:00:00Z' },
            { ...makeView(2), deactivated_datetime: '2024-01-01T00:00:00Z' },
        ])

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).not.toHaveBeenCalled()
    })

    it('emits the union of system + public views via getAllViewsOrdered (system first, dedupe by id)', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        // Public views from the no-category cache.
        setAllViews([makeView(1), makeView(2)])
        // System views must use real names; selectSystemViews filters by
        // TOP/BOTTOM_SYSTEM_VIEW_NAMES.
        setSystemViews([
            { id: 10, name: 'Inbox' } as View,
            { id: 11, name: 'Unassigned' } as View,
            { id: 12, name: 'All' } as View,
        ])

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        const [emitted] = onFetchAll.mock.calls[0] as [number[]]
        expect(emitted).toEqual([10, 11, 12, 1, 2])
    })

    it('skips views whose persisted lastFetchedAt is still inside initialFetchTtlSeconds', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
            config: { initialFetchTtlSeconds: 3600 },
        })

        setAllViews([makeView(1)])
        // setViewsCount stamps lastFetchedAt = now → well within the 1 h
        // initial-fetch TTL, so the scan finds nothing stale.
        setViewsCount({ 1: 5 })

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).not.toHaveBeenCalled()
    })

    it('skips views whose tick-TTL has expired but are still inside initialFetchTtlSeconds', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
            config: { initialFetchTtlSeconds: 3600 },
        })

        setAllViews([makeView(1)])
        // 10 minutes old: well past the per-count tick TTL (30 s for 5
        // tickets) but inside the 1 h initial-fetch TTL. The takeover scan
        // must not dispatch this view; redispatching every focus-driven
        // steal would defeat the bulk-refresh budget.
        viewsCountStore.setState({
            counts: {
                1: {
                    count: 5,
                    lastFetchedAt: new Date(
                        Date.now() - 10 * 60_000,
                    ).toISOString(),
                },
            },
        })

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).not.toHaveBeenCalled()
    })

    it('dispatches only the stale subset, leaving fresh views alone', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
            config: { initialFetchTtlSeconds: 3600 },
        })

        setAllViews([makeView(1), makeView(2)])
        setViewsCount({ 1: 5, 2: 5 })
        // View 1's persisted entry predates the initial-fetch TTL; view 2
        // stays fresh.
        viewsCountStore.setState((state) => ({
            counts: {
                ...state.counts,
                1: {
                    count: 5,
                    lastFetchedAt: new Date(
                        Date.now() - 2 * 60 * 60_000,
                    ).toISOString(),
                },
            },
        }))

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(onFetchAll).toHaveBeenCalledWith([1])
    })

    it('does not re-dispatch on a subsequent steal once counts are fresh', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1)])

        scheduler.start()
        await flushMicrotasks()
        expect(onFetchAll).toHaveBeenCalledTimes(1)

        // Simulate the reply landing — lastFetchedAt is stamped to now.
        setViewsCount({ 1: 5 })

        scheduler.steal()
        await flushMicrotasks()
        expect(onFetchAll).toHaveBeenCalledTimes(1)
    })

    it('redispatches on a takeover for views older than initialFetchTtlSeconds', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
            config: { initialFetchTtlSeconds: 3600 },
        })

        setAllViews([makeView(1)])
        viewsCountStore.setState({
            counts: {
                1: {
                    count: 5,
                    lastFetchedAt: new Date(
                        Date.now() - 2 * 60 * 60_000,
                    ).toISOString(),
                },
            },
        })

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(onFetchAll).toHaveBeenCalledWith([1])
    })

    it('is a no-op when no views are loaded yet', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).not.toHaveBeenCalled()
    })

    it('waits for the counts store to hydrate before scanning', async () => {
        const onFetchAll = vi.fn()
        let finishHydration: (() => void) | undefined
        const hasHydratedSpy = vi
            .spyOn(viewsCountStore.persist, 'hasHydrated')
            .mockReturnValue(false)
        const onFinishHydrationSpy = vi
            .spyOn(viewsCountStore.persist, 'onFinishHydration')
            .mockImplementation((cb) => {
                finishHydration = cb as () => void
                return () => {}
            })

        setAllViews([makeView(1)])
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })
        scheduler.start()
        await flushMicrotasks()

        expect(onFetchAll).not.toHaveBeenCalled()
        expect(finishHydration).toBeDefined()

        hasHydratedSpy.mockReturnValue(true)
        finishHydration?.()
        await flushMicrotasks()
        await flushMicrotasks()

        expect(onFetchAll).toHaveBeenCalledTimes(1)

        hasHydratedSpy.mockRestore()
        onFinishHydrationSpy.mockRestore()
    })
})

describe('lifecycle', () => {
    it('clears isLeader + nextTickAt on stop()', async () => {
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll: vi.fn(),
        })
        setAllViews([makeView(1)])

        scheduler.start()
        await flushMicrotasks()
        expect(viewsCountStore.getState().isLeader).toBe(true)

        scheduler.stop()

        expect(viewsCountStore.getState().isLeader).toBe(false)
        expect(viewsCountStore.getState().nextTickAt).toBeNull()
    })

    it('re-runs the takeover scan on steal()', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1)])

        scheduler.start()
        await flushMicrotasks()
        expect(onFetchAll).toHaveBeenCalledTimes(1)

        // counts stays empty → view still stale on second takeover.
        scheduler.steal()
        await flushMicrotasks()
        expect(onFetchAll).toHaveBeenCalledTimes(2)
    })

    it('does not crash when stop() is called without start()', () => {
        const scheduler = createScheduler({
            onRefresh: vi.fn(),
            onFetchAll: vi.fn(),
        })

        expect(() => scheduler.stop()).not.toThrow()
        expect(viewsCountStore.getState().isLeader).toBe(false)
    })
})

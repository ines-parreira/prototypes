import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    clearViewsCount,
    setViewsCount,
    viewsCountStore,
} from '../../store/viewsCountStore'
import {
    clearViewsCountV3,
    markViewAsViewedV3,
    setLastFetchAllAtV3,
    viewsCountStoreV3,
} from '../../store/viewsCountStoreV3'
import { createSchedulerV3 } from '../schedulerV3'

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
 * `markViewAsViewedV3` invocations produce distinct timestamps and a
 * deterministic V3 order.
 */
function markViewed(viewId: number): void {
    vi.advanceTimersByTime(1)
    markViewAsViewedV3(viewId)
}

beforeEach(() => {
    appQueryClient.clear()
    clearViewsCount()
    clearViewsCountV3()
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('tick', () => {
    it('emits expired recent view IDs', () => {
        const onRefresh = vi.fn()
        const scheduler = createSchedulerV3({ onRefresh })

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
        const scheduler = createSchedulerV3({ onRefresh })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 50 })
        markViewed(1)

        vi.advanceTimersByTime(10_000)
        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('always emits views with no lastFetchedAt', () => {
        const onRefresh = vi.fn()
        const scheduler = createSchedulerV3({ onRefresh })

        setAllViews([makeView(1)])
        markViewed(1) // no setViewsCount → no entry in viewsCountStore.counts

        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith([1])
    })

    it('uses per-count TTL: large views age out slower than small ones', () => {
        const onRefresh = vi.fn()
        const scheduler = createSchedulerV3({ onRefresh })

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

    it('refreshes a 100-count view after 60 s (1 min per 100 tickets)', () => {
        const onRefresh = vi.fn()
        const scheduler = createSchedulerV3({ onRefresh })

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
        const scheduler = createSchedulerV3({
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
        const scheduler = createSchedulerV3({
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
        const scheduler = createSchedulerV3({ onRefresh })

        setAllViews([makeView(1)])

        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('stamps nextTickAt on each tick', () => {
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            config: { tickIntervalSeconds: 7 },
        })

        const before = Date.now()
        scheduler.tick()

        const stamped = viewsCountStoreV3.getState().nextTickAt
        expect(stamped).not.toBeNull()
        expect((stamped ?? 0) - before).toBeGreaterThanOrEqual(7_000)
    })
})

describe('fetch all', () => {
    it('fires once on first leader takeover and stamps lastFetchAllAt', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1), makeView(2), makeView(3)])

        scheduler.start()
        await Promise.resolve()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(onFetchAll).toHaveBeenCalledWith([1, 2, 3])
        expect(viewsCountStoreV3.getState().lastFetchAllAt).not.toBeNull()
    })

    it('emits the union of system + public views via getAllViewsOrdered (system first, dedupe by id)', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        // Public views from the no-category cache (visibility undefined →
        // treated as public by usePublicViews filter).
        setAllViews([makeView(1), makeView(2)])
        // System views must use real names; selectSystemViews filters by
        // TOP/BOTTOM_SYSTEM_VIEW_NAMES.
        setSystemViews([
            { id: 10, name: 'Inbox' } as View,
            { id: 11, name: 'Unassigned' } as View,
            { id: 12, name: 'All' } as View,
        ])

        scheduler.start()
        await Promise.resolve()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        const [emitted] = onFetchAll.mock.calls[0] as [number[]]
        // System first (10, 11, 12 in top order), then public (1, 2).
        expect(emitted).toEqual([10, 11, 12, 1, 2])
    })

    it('does not fire when the stamp is younger than fetchAllMinCooldownSeconds', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1)])
        setLastFetchAllAtV3(new Date().toISOString())
        // Non-empty counts prove the prior fetch landed, so the cooldown
        // gate is honored. See the empty-counts bypass test below.
        setViewsCount({ 1: 5 })

        scheduler.start()
        await Promise.resolve()

        expect(onFetchAll).not.toHaveBeenCalled()
    })

    it('bypasses the cooldown when counts are empty (prior dispatch never landed)', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1)])
        setLastFetchAllAtV3(new Date().toISOString())
        // counts stays empty — simulates the dispatch-then-tab-close gap
        // where the stamp was persisted but the socket reply never arrived.

        scheduler.start()
        await Promise.resolve()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(onFetchAll).toHaveBeenCalledWith([1])
    })

    it('does not re-bypass the cooldown on focus while replies are still in flight', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1)])
        setLastFetchAllAtV3(new Date().toISOString())

        scheduler.start()
        await Promise.resolve()
        expect(onFetchAll).toHaveBeenCalledTimes(1)

        // Focus the tab again before any socket reply has landed. With the
        // recovery bypass naively keyed on empty counts, this would fire a
        // second full fetch-all and defeat the cooldown. The one-shot flag
        // suppresses it.
        scheduler.steal()
        await Promise.resolve()
        expect(onFetchAll).toHaveBeenCalledTimes(1)
    })

    it('re-fires on leader takeover when the stamp is older than fetchAllMinCooldownSeconds', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
            config: { fetchAllMinCooldownSeconds: 60 },
        })

        setAllViews([makeView(1)])
        const oldStamp = new Date(Date.now() - 5 * 60_000).toISOString()
        setLastFetchAllAtV3(oldStamp)
        setViewsCount({ 1: 5 })

        scheduler.start()
        await Promise.resolve()

        expect(onFetchAll).toHaveBeenCalledTimes(1)
        expect(viewsCountStoreV3.getState().lastFetchAllAt).not.toBe(oldStamp)
    })

    it('fires every leader takeover when the cooldown is 0', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
            config: { fetchAllMinCooldownSeconds: 0 },
        })

        setAllViews([makeView(1)])

        scheduler.start()
        await Promise.resolve()
        expect(onFetchAll).toHaveBeenCalledTimes(1)

        scheduler.steal()
        await Promise.resolve()
        expect(onFetchAll).toHaveBeenCalledTimes(2)
    })

    it('does not fire a second time on subsequent steal()', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        setAllViews([makeView(1)])

        scheduler.start()
        await Promise.resolve()
        expect(onFetchAll).toHaveBeenCalledTimes(1)

        // Simulate the socket reply landing between start and steal; with
        // counts populated, the cooldown gate is honored on the next leader
        // takeover instead of being bypassed.
        setViewsCount({ 1: 5 })

        scheduler.steal()
        await Promise.resolve()
        expect(onFetchAll).toHaveBeenCalledTimes(1)
    })

    it('is a no-op when no views are loaded yet', async () => {
        const onFetchAll = vi.fn()
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })

        scheduler.start()
        await Promise.resolve()

        expect(onFetchAll).not.toHaveBeenCalled()
        expect(viewsCountStoreV3.getState().lastFetchAllAt).toBeNull()
    })

    it('waits for the V1 counts store to hydrate before firing', async () => {
        const onFetchAll = vi.fn()
        let finishV1Hydration: (() => void) | undefined
        const hasHydratedSpy = vi
            .spyOn(viewsCountStore.persist, 'hasHydrated')
            .mockReturnValue(false)
        const onFinishHydrationSpy = vi
            .spyOn(viewsCountStore.persist, 'onFinishHydration')
            .mockImplementation((cb) => {
                finishV1Hydration = cb as () => void
                return () => {}
            })

        setAllViews([makeView(1)])
        const scheduler = createSchedulerV3({
            onRefresh: vi.fn(),
            onFetchAll,
        })
        scheduler.start()
        await Promise.resolve()

        // V1 still hydrating → maybeFireFetchAll has not run yet.
        expect(onFetchAll).not.toHaveBeenCalled()
        expect(finishV1Hydration).toBeDefined()

        // Simulate V1 finishing hydration; subsequent reads see counts ready.
        // Multiple microtask hops are required to drain Promise.all + .then +
        // becomeLeader's awaited continuation.
        hasHydratedSpy.mockReturnValue(true)
        finishV1Hydration?.()
        for (let i = 0; i < 5; i++) await Promise.resolve()

        expect(onFetchAll).toHaveBeenCalledTimes(1)

        hasHydratedSpy.mockRestore()
        onFinishHydrationSpy.mockRestore()
    })
})

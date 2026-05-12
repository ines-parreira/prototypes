import { appQueryClient } from '@repo/api-resources'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    clearViewsCount,
    setViewportViewIds,
    setViewsCount,
    viewsCountStore,
} from '../../store/viewsCountStore'
import { createViewCountScheduler } from '../viewCountScheduler'

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

beforeEach(() => {
    appQueryClient.clear()
    clearViewsCount()
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
})

describe('tick', () => {
    it('calls onRefresh with eligible view IDs', () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: { minRefreshIntervalSeconds: 10 },
        })

        setAllViews([makeView(1), makeView(2)])
        setViewsCount({ 1: 50, 2: 100 })

        vi.advanceTimersByTime(15_000)

        scheduler.tick()

        expect(onRefresh).toHaveBeenCalledWith(expect.arrayContaining([1, 2]))
    })

    it('does nothing when the store is empty', () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({ onRefresh })

        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('does nothing when no views are eligible', () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: { minRefreshIntervalSeconds: 600 },
        })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 50 })

        scheduler.tick()

        expect(onRefresh).not.toHaveBeenCalled()
    })
})

describe('start / steal / stop', () => {
    let pendingLocks: Array<{ reject: (reason?: unknown) => void }>

    beforeEach(() => {
        pendingLocks = []

        Object.defineProperty(navigator, 'locks', {
            value: {
                request: vi.fn(
                    (
                        _name: string,
                        optionsOrCb:
                            | Record<string, unknown>
                            | ((lock: unknown) => Promise<void>),
                        maybeCb?: (lock: unknown) => Promise<void>,
                    ) => {
                        const cb =
                            maybeCb ??
                            (optionsOrCb as (lock: unknown) => Promise<void>)
                        const steal =
                            typeof optionsOrCb === 'object' && optionsOrCb.steal

                        if (steal) {
                            for (const lock of pendingLocks) {
                                lock.reject(
                                    new DOMException('stolen', 'AbortError'),
                                )
                            }
                            pendingLocks = []
                        }

                        const result = cb({ name: 'view-count-scheduler' })

                        // The callback returns a never-resolving promise.
                        // We track a reject handle so steal() can break it.
                        const entry = { reject: (__r?: unknown) => {} }
                        const held = new Promise<void>((_, reject) => {
                            entry.reject = reject
                        })
                        pendingLocks.push(entry)

                        // Race so that rejecting `held` actually triggers the .catch()
                        // even though `result` never settles
                        return Promise.race([result, held])
                    },
                ),
            },
            configurable: true,
        })
    })

    afterEach(() => {
        // Drain pending locks to prevent leaks
        for (const lock of pendingLocks) {
            lock.reject(new DOMException('cleanup', 'AbortError'))
        }
        pendingLocks = []
    })

    it('stop is safe to call when not started', () => {
        const scheduler = createViewCountScheduler({
            onRefresh: vi.fn(),
        })

        expect(() => scheduler.stop()).not.toThrow()
    })

    it('start acquires the lock and sets isLeader', async () => {
        const scheduler = createViewCountScheduler({ onRefresh: vi.fn() })

        scheduler.start()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(true)
    })

    it('prioritises in-viewport views on the initial tick', async () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: {
                tickIntervalSeconds: 30,
                minRefreshIntervalSeconds: 0,
                initialMaxViews: 2,
                maxViewsPerTick: 2,
            },
        })

        setAllViews([makeView(1), makeView(2), makeView(3)])
        setViewsCount({ 1: 10, 2: 20, 3: 30 })
        setViewportViewIds([2, 3])

        scheduler.start()
        await Promise.resolve()

        expect(onRefresh).toHaveBeenCalledTimes(1)
        const [selected] = onRefresh.mock.calls[0] as [number[]]
        expect(selected.sort()).toEqual([2, 3])
    })

    it('uses initialMaxViews as the budget on the first tick after becoming leader', async () => {
        const onRefresh = vi.fn()
        const viewIds = Array.from({ length: 30 }, (_, i) => i + 1)
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: {
                tickIntervalSeconds: 30,
                minRefreshIntervalSeconds: 0,
                maxViewsPerTick: 5,
                initialMaxViews: 20,
            },
        })

        setAllViews(viewIds.map(makeView))
        setViewportViewIds(viewIds)

        scheduler.start()
        await Promise.resolve()

        expect(onRefresh).toHaveBeenCalledTimes(1)
        const [selected] = onRefresh.mock.calls[0] as [number[]]
        expect(selected).toHaveLength(20)
    })

    it('only treats the very first tick as initial — subsequent steals use maxViewsPerTick', async () => {
        const onRefresh = vi.fn()
        const viewIds = Array.from({ length: 30 }, (_, i) => i + 1)
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: {
                tickIntervalSeconds: 30,
                minRefreshIntervalSeconds: 0,
                maxViewsPerTick: 5,
                initialMaxViews: 20,
            },
        })

        setAllViews(viewIds.map(makeView))
        setViewportViewIds(viewIds)

        scheduler.start()
        await Promise.resolve()

        expect((onRefresh.mock.calls[0] as [number[]])[0]).toHaveLength(20)

        onRefresh.mockClear()
        scheduler.steal()
        await Promise.resolve()

        expect(onRefresh).toHaveBeenCalledTimes(1)
        expect((onRefresh.mock.calls[0] as [number[]])[0]).toHaveLength(5)
    })

    it('falls back to non-viewport views when nothing is in the viewport', async () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: { tickIntervalSeconds: 30, minRefreshIntervalSeconds: 0 },
        })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 10 })

        scheduler.start()
        await Promise.resolve()

        expect(onRefresh).toHaveBeenCalledWith(expect.arrayContaining([1]))
    })

    it('stop clears isLeader and stops ticking', async () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: { tickIntervalSeconds: 1, minRefreshIntervalSeconds: 0 },
        })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 10 })

        scheduler.start()
        await Promise.resolve()

        scheduler.stop()

        expect(viewsCountStore.getState().isLeader).toBe(false)

        onRefresh.mockClear()
        await vi.advanceTimersByTimeAsync(5000)
        expect(onRefresh).not.toHaveBeenCalled()
    })

    it('steal takes leadership from the previous holder', async () => {
        const scheduler1 = createViewCountScheduler({ onRefresh: vi.fn() })
        const scheduler2 = createViewCountScheduler({ onRefresh: vi.fn() })

        scheduler1.start()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(true)

        scheduler2.steal()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(true)
        expect(navigator.locks.request).toHaveBeenCalledWith(
            'view-count-scheduler',
            { steal: true },
            expect.any(Function),
        )
    })

    it('cleans up when the lock is stolen by another tab', async () => {
        const onRefresh = vi.fn()
        const scheduler = createViewCountScheduler({
            onRefresh,
            config: { tickIntervalSeconds: 1, minRefreshIntervalSeconds: 0 },
        })

        setAllViews([makeView(1)])
        setViewsCount({ 1: 10 })

        scheduler.start()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(true)

        for (const lock of pendingLocks) {
            lock.reject(new DOMException('stolen', 'AbortError'))
        }
        pendingLocks = []
        await Promise.resolve()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(false)
    })

    it('falls back to running as leader when navigator.locks is unavailable', async () => {
        const originalLocks = navigator.locks
        Object.defineProperty(navigator, 'locks', {
            value: undefined,
            configurable: true,
        })

        try {
            const onRefresh = vi.fn()
            const scheduler = createViewCountScheduler({
                onRefresh,
                config: {
                    tickIntervalSeconds: 1,
                    minRefreshIntervalSeconds: 0,
                },
            })

            setAllViews([makeView(1)])
            setViewsCount({ 1: 10 })

            scheduler.start()
            await Promise.resolve()

            expect(viewsCountStore.getState().isLeader).toBe(true)

            await vi.advanceTimersByTimeAsync(1500)
            expect(onRefresh).toHaveBeenCalled()

            scheduler.stop()
            expect(viewsCountStore.getState().isLeader).toBe(false)
        } finally {
            Object.defineProperty(navigator, 'locks', {
                value: originalLocks,
                configurable: true,
            })
        }
    })

    it('waits for hydration before setting isLeader', async () => {
        const hydrationCallbacks: Array<() => void> = []
        vi.spyOn(viewsCountStore.persist, 'hasHydrated').mockReturnValue(false)
        vi.spyOn(
            viewsCountStore.persist,
            'onFinishHydration',
        ).mockImplementation((cb) => {
            hydrationCallbacks.push(cb as () => void)
            return () => {}
        })

        const scheduler = createViewCountScheduler({ onRefresh: vi.fn() })

        scheduler.start()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(false)

        vi.spyOn(viewsCountStore.persist, 'hasHydrated').mockReturnValue(true)
        for (const cb of hydrationCallbacks) cb()
        await Promise.resolve()

        expect(viewsCountStore.getState().isLeader).toBe(true)

        vi.restoreAllMocks()
    })
})

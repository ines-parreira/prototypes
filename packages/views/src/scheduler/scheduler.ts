import { getAllViewsOrdered } from '../hooks/useAllViewsOrdered'
import { isViewDeactivated } from '../predicates/isViewDeactivated'
import { logViewEvent } from '../store/viewEventLog'
import { setNextTickAt, viewsCountStore } from '../store/viewsCountStore'
import type { RefreshConfig } from './refreshConfig'
import { DEFAULT_REFRESH_CONFIG, getTtlSecondsForCount } from './refreshConfig'

export type RefreshCallback = (viewIds: number[]) => void
export type FetchAllCallback = (viewIds: number[]) => void

export type SchedulerOptions = {
    onRefresh: RefreshCallback
    /**
     * Fired on leader takeover with the IDs of every view whose persisted
     * count is missing or older than its per-count TTL. View IDs come from
     * `getAllViewsOrdered()` so the dispatch order matches the sidebar
     * (system → public → private).
     */
    onFetchAll?: FetchAllCallback
    config?: Partial<RefreshConfig>
    /**
     * Return false to skip refreshing this tick (e.g. off the views surface).
     */
    shouldRefresh?: () => boolean
}

export type Scheduler = {
    start: () => void
    steal: () => void
    stop: () => void
    tick: () => void
}

export function createScheduler(options: SchedulerOptions): Scheduler {
    const config: RefreshConfig = {
        ...DEFAULT_REFRESH_CONFIG,
        ...options.config,
    }
    let activeIntervalId: ReturnType<typeof setInterval> | null = null

    /**
     * Selects the most recently viewed views from the LRU, capped at
     * `maxRecentViews`. Pairs each with its `count` and `lastFetchedAt` so
     * the per-count TTL check works against the same data the UI shows.
     */
    function getRecentEntries(): Array<[number, number, string | null]> {
        const { recent, counts } = viewsCountStore.getState()

        return Object.entries(recent)
            .sort(
                (a, b) => Date.parse(b[1].viewedAt) - Date.parse(a[1].viewedAt),
            )
            .slice(0, config.maxRecentViews)
            .map(([id]) => {
                const viewId = Number(id)
                const entry = counts[viewId]
                return [viewId, entry?.count ?? 0, entry?.lastFetchedAt ?? null]
            })
    }

    function isTickStale(
        lastFetchedAt: string | null | undefined,
        count: number,
        now: number,
    ): boolean {
        if (!lastFetchedAt) return true
        const ttlMs = getTtlSecondsForCount(count, config) * 1000
        return now - Date.parse(lastFetchedAt) >= ttlMs
    }

    function tick(): void {
        setNextTickAt(Date.now() + config.tickIntervalSeconds * 1000)

        if (options.shouldRefresh && !options.shouldRefresh()) return

        const now = Date.now()
        const expired: number[] = []
        for (const [viewId, count, lastFetchedAt] of getRecentEntries()) {
            if (isTickStale(lastFetchedAt, count, now)) expired.push(viewId)
        }

        if (expired.length === 0) return

        options.onRefresh(expired)
        logViewEvent('outbound', 'views-count-expired', expired)
    }

    /**
     * On leader takeover, dispatch every view whose persisted count is
     * missing or older than `initialFetchTtlSeconds`. The persisted
     * `lastFetchedAt` per view is the single source of truth — there is
     * no global cooldown stamp to keep in sync across tabs. A reloading
     * tab whose counts are still fresh dispatches nothing; a tab whose
     * previous session crashed before replies landed sees stale/missing
     * entries and naturally retries.
     *
     * This threshold is separate from `ttlSecondsByCount` (per-tick) on
     * purpose — the tick TTL is short (small views: 30 s) because the
     * recent set is small. Applying it to the takeover scan would make
     * every focus-driven steal redispatch the entire sidebar.
     */
    function refreshStaleViews(): void {
        if (!options.onFetchAll) return
        const allViews = getAllViewsOrdered()
        if (allViews.length === 0) return

        const { counts } = viewsCountStore.getState()
        const now = Date.now()
        const staleThresholdMs = config.initialFetchTtlSeconds * 1000
        const stale: number[] = []
        for (const view of allViews) {
            // Deactivated views don't render a count badge in the sidebar
            // and the server returns 0 for them — dispatching wastes a
            // round-trip per view on every takeover.
            if (isViewDeactivated(view)) continue
            const entry = counts[view.id]
            if (!entry?.lastFetchedAt) {
                stale.push(view.id)
                continue
            }
            if (now - Date.parse(entry.lastFetchedAt) >= staleThresholdMs) {
                stale.push(view.id)
            }
        }
        if (stale.length === 0) return

        options.onFetchAll(stale)
    }

    function waitForHydration(): Promise<void> {
        // `viewsCountStore` holds per-view `lastFetchedAt` stamps that the
        // takeover scan compares against TTLs. Without this wait, a cold
        // start would see an empty `counts` map and dispatch every view —
        // including ones whose persisted counts are still fresh.
        if (viewsCountStore.persist.hasHydrated()) {
            return Promise.resolve()
        }
        return new Promise<void>((resolve) => {
            viewsCountStore.persist.onFinishHydration(() => resolve())
        })
    }

    function cleanup(): void {
        if (activeIntervalId !== null) {
            clearInterval(activeIntervalId)
            activeIntervalId = null
        }
        viewsCountStore.setState({
            isLeader: false,
            nextTickAt: null,
        })
    }

    async function becomeLeader(): Promise<void> {
        await waitForHydration()
        viewsCountStore.setState({ isLeader: true })
        refreshStaleViews()
        tick()
        activeIntervalId = setInterval(tick, config.tickIntervalSeconds * 1000)
    }

    function hasWebLocks(): boolean {
        return (
            typeof navigator !== 'undefined' &&
            typeof navigator.locks?.request === 'function'
        )
    }

    function acquireLock(steal: boolean): void {
        cleanup()

        if (!hasWebLocks()) {
            void becomeLeader()
            return
        }

        navigator.locks
            .request(
                'view-count-scheduler-v3',
                steal ? { steal: true } : {},
                async () => {
                    await becomeLeader()
                    return new Promise<void>(() => {
                        // Never resolves — held until stolen or tab closes
                    })
                },
            )
            .catch(() => {
                cleanup()
            })
    }

    function start(): void {
        acquireLock(false)
    }

    function steal(): void {
        acquireLock(true)
    }

    function stop(): void {
        cleanup()
    }

    return { start, steal, stop, tick }
}

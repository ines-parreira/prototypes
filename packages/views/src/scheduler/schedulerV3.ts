import { getAllViewsOrdered } from '../hooks/useAllViewsOrdered'
import { logViewEvent } from '../store/viewEventLog'
import { viewsCountStore } from '../store/viewsCountStore'
import {
    setLastFetchAllAtV3,
    setNextTickAtV3,
    viewsCountStoreV3,
} from '../store/viewsCountStoreV3'
import type { RefreshConfigV3 } from './refreshConfigV3'
import {
    DEFAULT_REFRESH_CONFIG_V3,
    getTtlSecondsForCount,
} from './refreshConfigV3'

export type RefreshCallbackV3 = (viewIds: number[]) => void
export type FetchAllCallbackV3 = (viewIds: number[]) => void

export type SchedulerOptionsV3 = {
    onRefresh: RefreshCallbackV3
    /**
     * Fired on leader takeover when the cooldown has elapsed. View IDs are
     * sourced from `getAllViewsOrdered()` — the same sidebar-ordered list
     * (system → public → private) the legacy `fetchVisibleViewsCounts`
     * action emitted.
     */
    onFetchAll?: FetchAllCallbackV3
    config?: Partial<RefreshConfigV3>
    /**
     * Return false to skip refreshing this tick (e.g. off the views surface).
     */
    shouldRefresh?: () => boolean
}

export type SchedulerV3 = {
    start: () => void
    steal: () => void
    stop: () => void
    tick: () => void
}

export function createSchedulerV3(options: SchedulerOptionsV3): SchedulerV3 {
    const config: RefreshConfigV3 = {
        ...DEFAULT_REFRESH_CONFIG_V3,
        ...options.config,
    }
    let activeIntervalId: ReturnType<typeof setInterval> | null = null
    // Set the first time this scheduler instance fires `onFetchAll`. Used to
    // ensure the empty-counts cooldown bypass runs at most once per scheduler
    // instance — otherwise focus events during the chunked dispatch window
    // (where `counts` is briefly empty) would re-trigger the bypass and
    // defeat the cooldown.
    let hasFiredFetchAll = false

    /**
     * Selects the most recently viewed views from the v3 LRU, capped at
     * `maxRecentViews`. Pairs each with its `count` and `lastFetchedAt` from
     * the shared `viewsCountStore` so the per-count TTL check works against
     * the same count data the UI shows.
     */
    function getRecentEntries(): Array<[number, number, string | null]> {
        const { recent } = viewsCountStoreV3.getState()
        const { counts } = viewsCountStore.getState()

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

    function tick(): void {
        setNextTickAtV3(Date.now() + config.tickIntervalSeconds * 1000)

        if (options.shouldRefresh && !options.shouldRefresh()) return

        const now = Date.now()
        const expired: number[] = []
        for (const [viewId, count, lastFetchedAt] of getRecentEntries()) {
            if (lastFetchedAt === null) {
                expired.push(viewId)
                continue
            }
            const ttlMs = getTtlSecondsForCount(count, config) * 1000
            const age = now - Date.parse(lastFetchedAt)
            if (age >= ttlMs) expired.push(viewId)
        }

        if (expired.length === 0) return

        options.onRefresh(expired)
        logViewEvent('outbound', 'views-count-expired', expired)
    }

    function maybeFireFetchAll(): void {
        if (!options.onFetchAll) return
        const { lastFetchAllAt } = viewsCountStoreV3.getState()
        const { counts } = viewsCountStore.getState()

        const neverRan = lastFetchAllAt === null
        const cooldownElapsed =
            lastFetchAllAt !== null &&
            Date.now() - Date.parse(lastFetchAllAt) >=
                config.fetchAllMinCooldownSeconds * 1000
        // One-shot recovery: a stamp paired with an empty counts map is
        // evidence a prior session dispatched but the replies never landed
        // (tab closed mid-flight, socket drop, localForage write failure).
        // `hasFiredFetchAll` is scheduler-instance-local, so we recover at
        // most once per tab — focus events during the chunked dispatch
        // window (where counts is briefly empty by design) are ignored.
        const isRecoveryRun =
            !hasFiredFetchAll && Object.keys(counts).length === 0

        const shouldFire = neverRan || cooldownElapsed || isRecoveryRun
        if (!shouldFire) return

        const viewIds = getAllViewsOrdered().map((view) => view.id)
        if (viewIds.length === 0) return

        hasFiredFetchAll = true
        setLastFetchAllAtV3(new Date().toISOString())
        options.onFetchAll(viewIds)
        // Per-chunk log entries are emitted by the `onFetchAll` callback
        // (see `sendFetchAllChunks`) to reflect the actual network sends.
    }

    function waitForHydration(): Promise<void> {
        // V1 counts also hydrate from localForage. Without this wait,
        // `maybeFireFetchAll` reads an empty `counts` map on every cold
        // start and the recovery branch fires before persisted counts are
        // available — defeating the cooldown on every tab load.
        if (
            viewsCountStoreV3.persist.hasHydrated() &&
            viewsCountStore.persist.hasHydrated()
        ) {
            return Promise.resolve()
        }
        return Promise.all([
            waitForStoreHydration(viewsCountStoreV3),
            waitForStoreHydration(viewsCountStore),
        ]).then(() => undefined)
    }

    function waitForStoreHydration(store: {
        persist: {
            hasHydrated: () => boolean
            onFinishHydration: (cb: () => void) => void
        }
    }): Promise<void> {
        if (store.persist.hasHydrated()) return Promise.resolve()
        return new Promise<void>((resolve) => {
            store.persist.onFinishHydration(() => resolve())
        })
    }

    function cleanup(): void {
        if (activeIntervalId !== null) {
            clearInterval(activeIntervalId)
            activeIntervalId = null
        }
        if (viewsCountStoreV3.persist.hasHydrated()) {
            viewsCountStoreV3.setState({
                isLeader: false,
                nextTickAt: null,
            })
        }
    }

    async function becomeLeader(): Promise<void> {
        await waitForHydration()
        viewsCountStoreV3.setState({ isLeader: true })
        maybeFireFetchAll()
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

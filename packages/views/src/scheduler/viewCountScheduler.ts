import {
    isViewDeactivated,
    isViewInViewport,
    isViewLowPriority,
    isViewRealtime,
    isViewSystem,
    isViewVisible,
} from '../predicates'
import { logViewEvent } from '../store/viewEventLog'
import { setScores, viewsCountStore } from '../store/viewsCountStore'
import { getAllViews } from '../store/viewStore'
import type {
    RefreshConfig,
    ViewRefreshCandidate,
} from './selectViewsToRefresh'
import {
    DEFAULT_REFRESH_CONFIG,
    scoreView,
    selectViewsToRefresh,
} from './selectViewsToRefresh'

export type RefreshCallback = (viewIds: number[]) => void

export type ViewCountSchedulerOptions = {
    onRefresh: RefreshCallback
    config?: Partial<RefreshConfig>
}

export type ViewCountScheduler = {
    start: () => void
    steal: () => void
    stop: () => void
    tick: () => void
}

export function createViewCountScheduler(
    options: ViewCountSchedulerOptions,
): ViewCountScheduler {
    const config: RefreshConfig = {
        ...DEFAULT_REFRESH_CONFIG,
        ...options.config,
    }
    let activeIntervalId: ReturnType<typeof setInterval> | null = null

    function getCandidates(): ViewRefreshCandidate[] {
        const views = getAllViews()
        const { counts } = viewsCountStore.getState()

        return views.map((view) => {
            const entry = counts[view.id]
            return {
                viewId: view.id,
                count: entry?.count ?? 0,
                lastFetchedAt: entry?.lastFetchedAt ?? null,
                lastViewedAt: entry?.lastViewedAt ?? null,
                isRealtimeView: isViewRealtime(view),
                isVisible: isViewVisible(view),
                isInViewport: isViewInViewport(view.id),
                isSystemView: isViewSystem(view),
                isLowPriority: isViewLowPriority(view),
                isDeactivated: isViewDeactivated(view),
            }
        })
    }

    function tick(): void {
        const candidates = getCandidates()
        if (candidates.length === 0) return

        const now = Date.now()
        const { activeViewId } = viewsCountStore.getState()
        const activeViewIds = activeViewId !== null ? [activeViewId] : []

        const scores: Record<number, number> = {}
        for (const candidate of candidates) {
            scores[candidate.viewId] = scoreView({
                candidate,
                config,
                now,
                activeViewIds,
            })
        }
        setScores(scores)

        const viewIds = selectViewsToRefresh({
            candidates,
            config,
            now,
            activeViewIds,
        })
        if (viewIds.length === 0) return

        options.onRefresh(viewIds)
        logViewEvent('outbound', 'views-count-expired', viewIds)
    }

    function waitForHydration(): Promise<void> {
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
        if (viewsCountStore.persist.hasHydrated()) {
            viewsCountStore.setState({ isLeader: false })
        }
    }

    function acquireLock(steal: boolean): void {
        cleanup()
        navigator.locks
            .request(
                'view-count-scheduler',
                steal ? { steal: true } : {},
                async () => {
                    await waitForHydration()
                    viewsCountStore.setState({ isLeader: true })
                    activeIntervalId = setInterval(
                        tick,
                        config.tickIntervalSeconds * 1000,
                    )
                    return new Promise<void>(() => {
                        // Never resolves — held until stolen or tab closes
                    })
                },
            )
            .catch(() => {
                // Lock was stolen by another tab
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

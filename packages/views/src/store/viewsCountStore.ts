import { localForageManager } from '@repo/browser-storage'
import { createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

import { getViewIdFromUrl } from '../utils/url'

export type ViewCountEntry = {
    count: number
    lastFetchedAt: string
}

/**
 * Per-view recent-set entry. The map of these is the LRU pool the
 * scheduler polls each tick — only views the user has actually
 * activated this session are eligible.
 */
export type RecentEntry = {
    viewedAt: string
}

export type ViewsCountState = {
    /** Persisted per-view counts. Source of truth for staleness checks. */
    counts: Record<number, ViewCountEntry>
    /** LRU-ordered map of recently activated views. Session-local. */
    recent: Record<number, RecentEntry>
    /** Whether this tab currently holds the scheduler lock. */
    isLeader: boolean
    /** Wall-clock ms timestamp of the leader's next tick. Debug only. */
    nextTickAt: number | null
    setCounts: (counts: Record<number, number>) => void
}

export function useViewCount(viewId: number): number | undefined {
    return useStore(
        viewsCountStore,
        useShallow((state) => state.counts[viewId]?.count ?? undefined),
    )
}

export function setViewsCount(counts: Record<number, number>): void {
    viewsCountStore.getState().setCounts(counts)
}

export function getViewCount(viewId: number): number | undefined {
    return viewsCountStore.getState().counts[viewId]?.count ?? undefined
}

export function getViewCountEntry(viewId: number): ViewCountEntry | undefined {
    return viewsCountStore.getState().counts[viewId] ?? undefined
}

export function clearViewsCount(): void {
    viewsCountStore.setState({
        counts: {},
        recent: {},
        isLeader: false,
        nextTickAt: null,
    })
}

export function markViewAsViewed(viewId: number): void {
    viewsCountStore.setState((state) => ({
        recent: {
            ...state.recent,
            [viewId]: { viewedAt: new Date().toISOString() },
        },
    }))
}

export function setNextTickAt(value: number | null): void {
    viewsCountStore.setState({ nextTickAt: value })
}

/**
 * Mirrors the URL's active view ID into the LRU recent set so the
 * scheduler's tick refresh picks up navigation. Runs after hydration
 * (via `onRehydrateStorage`) and on every URL change (`startUrlWatcher`).
 */
function syncViewedFromUrl(): void {
    const urlViewId = getViewIdFromUrl()
    if (urlViewId !== null) markViewAsViewed(urlViewId)
}

function startUrlWatcher(): void {
    if (window.navigation) {
        window.navigation.addEventListener('navigatesuccess', syncViewedFromUrl)
        return
    }
    window.addEventListener('popstate', syncViewedFromUrl)

    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)

    history.pushState = (...args) => {
        originalPushState(...args)
        syncViewedFromUrl()
    }

    history.replaceState = (...args) => {
        originalReplaceState(...args)
        syncViewedFromUrl()
    }
}

const viewsCountTable = localForageManager.getTable('view-counts')

export const viewsCountStore = createStore<ViewsCountState>()(
    persist(
        (set) => ({
            counts: {},
            recent: {},
            isLeader: false,
            nextTickAt: null,
            setCounts: (incoming) =>
                set((state) => {
                    const now = new Date().toISOString()
                    const updated = { ...state.counts }
                    for (const [viewId, count] of Object.entries(incoming)) {
                        const id = Number(viewId)
                        updated[id] = { count, lastFetchedAt: now }
                    }
                    return { counts: updated }
                }),
        }),
        {
            name: 'view-counts',
            storage: createJSONStorage(() => ({
                getItem: (name: string) =>
                    viewsCountTable.getItem<string>(name),
                setItem: (name: string, value: string) => {
                    void viewsCountTable.setItem(name, value)
                },
                removeItem: (name: string) => {
                    void viewsCountTable.removeItem(name)
                },
            })),
            // Only `counts` is persisted. The recent set is intentionally
            // session-local: a fresh tab starts with an empty LRU and only
            // views the user activates this session count toward refresh
            // selection. `isLeader` and `nextTickAt` are runtime-only.
            partialize: (state) => ({ counts: state.counts }),
            onRehydrateStorage: () => () => {
                syncViewedFromUrl()
                startUrlWatcher()
            },
        },
    ),
)

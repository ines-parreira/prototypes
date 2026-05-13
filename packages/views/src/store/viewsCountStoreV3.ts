import { localForageManager } from '@repo/browser-storage'
import { createStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Per-view recent-set entry. The map of these is the LRU pool that the
 * v3 scheduler polls — only views the user has actually activated this
 * session are eligible.
 */
export type RecentEntryV3 = {
    viewedAt: string
}

export type ViewsCountStateV3 = {
    /** LRU-ordered map of recently activated views. Not persisted. */
    recent: Record<number, RecentEntryV3>
    /**
     * Wall-clock ISO timestamp of when the leader scheduler last fired the
     * one-shot "all views" fetch. Persisted so subsequent tabs / reloads
     * within the same logged-in session skip the boot burst.
     */
    lastFetchAllAt: string | null
    /**
     * Wall-clock timestamp (ms) of when the leader scheduler will next fire
     * a tick. Used only by the debug panel; not persisted.
     */
    nextTickAt: number | null
    isLeader: boolean
}

const viewsCountTableV3 = localForageManager.getTable('views-count-v3')

export const viewsCountStoreV3 = createStore<ViewsCountStateV3>()(
    persist(
        (): ViewsCountStateV3 => ({
            recent: {},
            lastFetchAllAt: null,
            nextTickAt: null,
            isLeader: false,
        }),
        {
            name: 'views-count-v3',
            storage: createJSONStorage(() => ({
                getItem: (name: string) =>
                    viewsCountTableV3.getItem<string>(name),
                setItem: (name: string, value: string) => {
                    void viewsCountTableV3.setItem(name, value)
                },
                removeItem: (name: string) => {
                    void viewsCountTableV3.removeItem(name)
                },
            })),
            // The recent set is intentionally session-local: a fresh tab
            // starts with an empty LRU and only the views the user actually
            // navigates to in this session count toward refresh selection.
            partialize: (state) => ({
                lastFetchAllAt: state.lastFetchAllAt,
            }),
        },
    ),
)

export function markViewAsViewedV3(viewId: number): void {
    viewsCountStoreV3.setState((state) => ({
        recent: {
            ...state.recent,
            [viewId]: { viewedAt: new Date().toISOString() },
        },
    }))
}

export function getLastFetchAllAtV3(): string | null {
    return viewsCountStoreV3.getState().lastFetchAllAt
}

export function setLastFetchAllAtV3(value: string | null): void {
    viewsCountStoreV3.setState({ lastFetchAllAt: value })
}

export function setNextTickAtV3(value: number | null): void {
    viewsCountStoreV3.setState({ nextTickAt: value })
}

export function clearViewsCountV3(): void {
    viewsCountStoreV3.setState({
        recent: {},
        lastFetchAllAt: null,
        nextTickAt: null,
        isLeader: false,
    })
}

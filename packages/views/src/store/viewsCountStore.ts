import { localForageManager } from '@repo/browser-storage'
import { createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

import { getViewIdFromUrl } from '../utils/url'

export type ViewCountEntry = {
    count: number
    lastFetchedAt: string
    lastViewedAt: string | null
}

export type ViewsCountState = {
    counts: Record<number, ViewCountEntry>
    scores: Record<number, number>
    isLeader: boolean
    activeViewId: number | null
    fallbackActiveViewId: number | null
    expandedSectionIds: string[] | undefined
    viewportViewIds: number[]
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

export function markViewAsViewed(viewId: number): void {
    viewsCountStore.setState((state) => {
        const entry = state.counts[viewId]
        if (!entry) return state
        return {
            counts: {
                ...state.counts,
                [viewId]: {
                    ...entry,
                    lastViewedAt: new Date().toISOString(),
                },
            },
        }
    })
}

export function getActiveViewId(): number | null {
    return viewsCountStore.getState().activeViewId
}

export function setActiveViewFallback(viewId: number | null): void {
    const urlViewId = getViewIdFromUrl()
    viewsCountStore.setState({
        fallbackActiveViewId: viewId,
        activeViewId: urlViewId ?? viewId,
    })
}

export function getExpandedSectionIds(): string[] | undefined {
    return viewsCountStore.getState().expandedSectionIds
}

export function expandSection(sectionId: string): void {
    viewsCountStore.setState((state) => {
        const ids = state.expandedSectionIds ?? []
        if (ids.includes(sectionId)) return state
        return { expandedSectionIds: [...ids, sectionId] }
    })
}

export function collapseSection(sectionId: string): void {
    viewsCountStore.setState((state) => {
        const ids = state.expandedSectionIds ?? []
        if (!ids.includes(sectionId)) return state
        return {
            expandedSectionIds: ids.filter((id) => id !== sectionId),
        }
    })
}

export function setScores(scores: Record<number, number>): void {
    viewsCountStore.setState({ scores })
}

export function setViewportViewIds(viewIds: number[]): void {
    viewsCountStore.setState({ viewportViewIds: viewIds })
}

export function getViewportViewIds(): number[] {
    return viewsCountStore.getState().viewportViewIds
}

export function clearViewsCount(): void {
    viewsCountStore.setState({
        counts: {},
        scores: {},
        activeViewId: null,
        fallbackActiveViewId: null,
        expandedSectionIds: undefined,
        viewportViewIds: [],
    })
}

function syncViewedFromUrl(): void {
    const urlViewId = getViewIdFromUrl()
    const { fallbackActiveViewId } = viewsCountStore.getState()
    viewsCountStore.setState({
        activeViewId: urlViewId ?? fallbackActiveViewId,
    })
    if (urlViewId !== null) {
        markViewAsViewed(urlViewId)
    }
}

function startUrlWatcher(): void {
    if (window.navigation) {
        window.navigation.addEventListener('navigatesuccess', syncViewedFromUrl)
    } else {
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
}

const viewsCountTable = localForageManager.getTable('views-count')

export const viewsCountStore = createStore<ViewsCountState>()(
    persist(
        (set) => ({
            counts: {},
            scores: {},
            isLeader: false,
            activeViewId: null,
            fallbackActiveViewId: null,
            expandedSectionIds: undefined,
            viewportViewIds: [],
            setCounts: (incoming) =>
                set((state) => {
                    const now = new Date().toISOString()
                    const updated = { ...state.counts }
                    for (const [viewId, count] of Object.entries(incoming)) {
                        const id = Number(viewId)
                        updated[id] = {
                            count,
                            lastFetchedAt: now,
                            lastViewedAt:
                                state.counts[id]?.lastViewedAt ?? null,
                        }
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
            partialize: (state) => ({
                counts: state.counts,
                activeViewId: state.activeViewId,
                expandedSectionIds: state.expandedSectionIds,
            }),
            onRehydrateStorage: () => () => {
                syncViewedFromUrl()
                startUrlWatcher()
            },
        },
    ),
)

import { localForageManager } from '@repo/browser-storage'
import { createStore, useStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

export type ViewsCountState = {
    counts: Record<number, number>
    setCounts: (counts: Record<number, number>) => void
}

export function useViewCount(viewId: number): number | undefined {
    return useStore(
        viewsCountStore,
        useShallow((state) => state.counts[viewId] || undefined),
    )
}

export function setViewsCount(counts: Record<number, number>) {
    viewsCountStore.getState().setCounts(counts)
}

const viewsCountTable = localForageManager.getTable('views-count')

export const viewsCountStore = createStore<ViewsCountState>()(
    persist(
        (set) => ({
            counts: {},
            setCounts: (incoming) =>
                set((state) => ({ counts: { ...state.counts, ...incoming } })),
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
            partialize: (state) => ({ counts: state.counts }),
        },
    ),
)

import { localForageManager } from '@repo/browser-storage'
import { createStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type ActiveViewState = {
    activeViewId: number | null
}

const activeViewTable = localForageManager.getTable('active-view')

export const activeViewStore = createStore<ActiveViewState>()(
    persist((): ActiveViewState => ({ activeViewId: null }), {
        name: 'active-view',
        storage: createJSONStorage(() => ({
            getItem: (name: string) => activeViewTable.getItem<string>(name),
            setItem: (name: string, value: string) => {
                void activeViewTable.setItem(name, value)
            },
            removeItem: (name: string) => {
                void activeViewTable.removeItem(name)
            },
        })),
    }),
)

export function setActiveViewId(id: number): void {
    activeViewStore.setState({ activeViewId: id })
}

export function clearActiveViewId(): void {
    activeViewStore.setState({ activeViewId: null })
}

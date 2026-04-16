import { localForageManager } from '@repo/browser-storage'
import { isEqual } from 'lodash'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

export type EvalStatus = 'match' | 'mismatch'

export type EvalEntry = {
    flag: string
    defaultValue: unknown
    launchdarklyValue: unknown
    harnessValue: unknown
    status: EvalStatus
    timestamp: number | null
}

type EvalState = {
    entries: Record<string, EvalEntry>
    addEntry: (flag: string, entry: EvalEntry) => void
    clear: () => void
}

const evalTable = localForageManager.getTable('feature-flags-eval')

export const evalStore = createStore<EvalState>()(
    persist(
        (set, get) => ({
            entries: {},
            addEntry: (flag, entry) => {
                const existing = get().entries[flag]
                if (
                    existing &&
                    existing.status === entry.status &&
                    isEqual(
                        existing.launchdarklyValue,
                        entry.launchdarklyValue,
                    ) &&
                    isEqual(existing.harnessValue, entry.harnessValue)
                )
                    return
                set((state) => ({
                    entries: { ...state.entries, [flag]: entry },
                }))
            },
            clear: () => {
                set({ entries: {} })
            },
        }),
        {
            name: 'feature-flags-eval',
            storage: createJSONStorage(() => ({
                getItem: (name: string) => evalTable.getItem<string>(name),
                setItem: (name: string, value: string) => {
                    void evalTable.setItem(name, value)
                },
                removeItem: (name: string) => {
                    void evalTable.removeItem(name)
                },
            })),
        },
    ),
)

import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'

const AI_JOURNEY_LAST_SELECTED_STORE_KEY = 'ai-journey-last-selected-store'

export const useLastSelectedStore = () => {
    const [lastSelectedStore, setLastSelectedStore] = useLocalStorage<
        string | null
    >(AI_JOURNEY_LAST_SELECTED_STORE_KEY, null)

    const resolveStore = useCallback(
        (availableStoreNames: string[]): string | undefined => {
            if (availableStoreNames.length === 0) return undefined

            if (
                lastSelectedStore &&
                availableStoreNames.includes(lastSelectedStore)
            ) {
                return lastSelectedStore
            }

            const firstStore = availableStoreNames[0]
            setLastSelectedStore(firstStore)
            return firstStore
        },
        [lastSelectedStore, setLastSelectedStore],
    )

    return { setLastSelectedStore, resolveStore }
}

import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'

const AI_AGENT_LAST_SELECTED_SHOP_KEY = `ai-agent:last-selected-shop:${window.location.hostname}`

export const useAiAgentLastSelectedShop = () => {
    const [lastSelectedShop, setLastSelectedShop] = useLocalStorage<
        string | null
    >(AI_AGENT_LAST_SELECTED_SHOP_KEY, null)

    const resolveShop = useCallback(
        (availableShopNames: string[]): string | undefined => {
            if (availableShopNames.length === 0) return undefined

            if (
                lastSelectedShop &&
                availableShopNames.includes(lastSelectedShop)
            ) {
                return lastSelectedShop
            }

            const firstShop = availableShopNames[0]
            setLastSelectedShop(firstShop)
            return firstShop
        },
        [lastSelectedShop, setLastSelectedShop],
    )

    return { setLastSelectedShop, resolveShop }
}

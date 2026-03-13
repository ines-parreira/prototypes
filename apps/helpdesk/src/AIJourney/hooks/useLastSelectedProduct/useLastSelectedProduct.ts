import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { Product } from 'constants/integrations/types/shopify'

const AI_JOURNEY_LAST_SELECTED_PRODUCT_KEY = 'ai-journey-last-selected-product'

export const useLastSelectedProduct = () => {
    const [lastSelectedProductId, setLastSelectedProductId] = useLocalStorage<
        number | null
    >(AI_JOURNEY_LAST_SELECTED_PRODUCT_KEY, null)

    const resolveProduct = useCallback(
        (availableProducts: Product[]): Product | undefined => {
            if (availableProducts.length === 0) return undefined

            if (lastSelectedProductId !== null) {
                const match = availableProducts.find(
                    (p) => p.id === lastSelectedProductId,
                )
                if (match) return match
            }

            const firstProduct = availableProducts[0]
            setLastSelectedProductId(firstProduct.id)
            return firstProduct
        },
        [lastSelectedProductId, setLastSelectedProductId],
    )

    return { setLastSelectedProductId, resolveProduct }
}

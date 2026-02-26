import { useMemo } from 'react'

import { useProductsMap } from '@repo/ecommerce/shopify/hooks'

import type { Order } from 'constants/integrations/types/shopify'

type Params = {
    integrationId: number | undefined
    order: Order | null
}

export function useWidgetOrderProducts({ integrationId, order }: Params) {
    const productExternalIds = useMemo(() => {
        if (!order) return []

        const ids = new Set<string>()

        order.line_items.forEach((lineItem) => {
            if (lineItem.product_id && lineItem.product_exists !== false) {
                ids.add(String(lineItem.product_id))
            }
        })

        return Array.from(ids)
    }, [order])

    const { productsMap } = useProductsMap({
        integrationId,
        productExternalIds,
    })

    return { productsMap }
}

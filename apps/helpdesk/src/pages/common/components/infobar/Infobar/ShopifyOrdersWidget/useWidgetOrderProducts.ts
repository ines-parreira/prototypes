import { useMemo } from 'react'

import { useProductsMap } from '@repo/ecommerce/shopify/hooks'

import type { Order } from 'constants/integrations/types/shopify'

type Params = {
    integrationId: number | undefined
    orders: Order[]
}

export function useWidgetOrderProducts({ integrationId, orders }: Params) {
    const productExternalIds = useMemo(() => {
        if (orders.length === 0) return []

        const ids = new Set<string>()

        orders.forEach((order) => {
            order.line_items.forEach((lineItem) => {
                if (lineItem.product_id && lineItem.product_exists !== false) {
                    ids.add(String(lineItem.product_id))
                }
            })
        })

        return Array.from(ids)
    }, [orders])

    const { productsMap } = useProductsMap({
        integrationId,
        productExternalIds,
    })

    return { productsMap }
}

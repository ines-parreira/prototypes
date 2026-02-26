import { useMemo } from 'react'

import { useProductsMap } from '@repo/ecommerce/shopify/hooks'

import type { OrderEcommerceData } from '../types'

type Params = {
    integrationId: number | undefined
    orders: OrderEcommerceData[] | undefined
}

export function useGetOrderProducts({ integrationId, orders }: Params) {
    const productExternalIds = useMemo(() => {
        if (!orders) return []

        const ids = new Set<string>()

        orders.forEach((order) => {
            order.data.line_items.forEach((lineItem) => {
                if (lineItem.product_id && lineItem.product_exists !== false) {
                    ids.add(String(lineItem.product_id))
                }
            })
        })

        return Array.from(ids)
    }, [orders])

    const { productsMap, isLoading } = useProductsMap({
        integrationId,
        productExternalIds,
    })

    return { productsMap, isLoading }
}

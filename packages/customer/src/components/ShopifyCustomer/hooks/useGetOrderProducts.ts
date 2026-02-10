import { useMemo } from 'react'

import type { OrderProduct, ShopifyProductData } from '@repo/ecommerce'
import { extractFeaturedImage, getProductImageList } from '@repo/ecommerce'

import {
    ObjectType,
    SourceType,
    useListEcommerceData,
} from '@gorgias/ecommerce-storage-queries'

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

    const isEnabled = !!integrationId && productExternalIds.length > 0
    const { data: productsResponse, isLoading } = useListEcommerceData(
        ObjectType.Product,
        SourceType.Shopify,
        {
            params: {
                limit: 100,
            },
        },
        {
            query: { enabled: isEnabled },
            http: {
                params: {
                    integration_id: integrationId,
                    external_ids: productExternalIds,
                },
            },
        },
    )

    const productsMap = useMemo(() => {
        const map = new Map<number, OrderProduct>()
        const products = productsResponse?.data?.data

        if (products) {
            products.forEach((product) => {
                const id = Number(product.external_id)

                if (!isNaN(id)) {
                    const data = product.data as ShopifyProductData

                    map.set(id, {
                        id,
                        title: data.title,
                        image: extractFeaturedImage(data),
                        images: getProductImageList(data),
                    })
                }
            })
        }

        return map
    }, [productsResponse])

    return { productsMap, isLoading }
}

import { useMemo } from 'react'

import {
    ObjectType,
    SourceType,
    useListEcommerceData,
} from '@gorgias/ecommerce-storage-queries'

import type { OrderCardProduct, ShopifyProductData } from '../types'
import { extractFeaturedImage } from '../utils/extractFeaturedImage'
import { getProductImageList } from '../utils/getProductImageList'

type Params = {
    integrationId: number | undefined
    productExternalIds: string[]
}

export function useProductsMap({ integrationId, productExternalIds }: Params) {
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
        const map = new Map<number, OrderCardProduct>()
        const products = productsResponse?.data?.data

        if (!products) return map

        products.forEach((product) => {
            const id = Number(product.external_id)

            if (!isNaN(id)) {
                const data = product.data as ShopifyProductData

                map.set(id, {
                    image: extractFeaturedImage(data),
                    images: getProductImageList(data),
                })
            }
        })

        return map
    }, [productsResponse])

    return { productsMap, isLoading }
}

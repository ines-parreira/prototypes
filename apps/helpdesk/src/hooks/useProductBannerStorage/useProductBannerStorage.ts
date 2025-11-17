import { useCallback } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { PRODUCT_BANNER_KEY } from './constants'
import type { ProductBannerItem } from './types/ProductBannerItem'
import type { ProductBannerRecord } from './types/ProductBannerRecord'

export function useProductBannerStorage() {
    const [products, setProducts] = useLocalStorage<ProductBannerRecord | null>(
        'gorgias:productBanners',
        null,
    )

    const getProductBanner = useCallback(
        (key: PRODUCT_BANNER_KEY): ProductBannerItem | null => {
            if (products) {
                return products[key] ?? null
            }
            return null
        },
        [products],
    )

    const updateProductBanner = useCallback(
        (key: PRODUCT_BANNER_KEY, payload: ProductBannerItem) => {
            setProducts({
                ...products,
                [key]: payload,
            })
        },
        [products, setProducts],
    )

    return {
        products,
        getProductBanner,
        updateProductBanner,
    }
}

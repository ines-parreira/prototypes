import { useEffect, useMemo } from 'react'

import type { Product } from 'constants/integrations/types/shopify'
import { useListProducts } from 'models/integration/queries'
import type { IntegrationDataItem } from 'models/integration/types'

type useAIJourneyProductListParams = {
    integrationId?: number
    filter?: string
}

const MINIMUM_PRODUCT_COUNT = 5

export const useAIJourneyProductList = ({
    integrationId,
    filter,
}: useAIJourneyProductListParams) => {
    const isSearching = !!filter

    const {
        data: paginatedProductItems,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useListProducts(
        integrationId ?? 0,
        !!integrationId,
        { limit: 100, ...(filter ? { filter } : {}) },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            keepPreviousData: isSearching,
            queryKey: [
                'integration',
                'shopify',
                integrationId ?? 0,
                'products',
                'list',
                filter ?? '',
            ],
        },
    )

    const productItemsData = paginatedProductItems?.pages?.reduce<
        IntegrationDataItem<Product>[]
    >((acc, page) => [...acc, ...page.data.data], [])

    const productList = useMemo<Product[]>(() => {
        const filtered = (productItemsData ?? [])
            .filter(
                (item) =>
                    item.data.status === 'active' &&
                    item.data.published_at !== null,
            )
            .filter((item) => !!item.data.image && !!item.data.title)
            .map((item) => item.data)

        return isSearching ? filtered : filtered.slice(0, MINIMUM_PRODUCT_COUNT)
    }, [productItemsData, isSearching])

    useEffect(() => {
        if (isSearching) return

        const needsMoreProducts = productList.length < MINIMUM_PRODUCT_COUNT
        const canFetchMore = hasNextPage && !isLoading && !isFetchingNextPage

        if (needsMoreProducts && canFetchMore) {
            fetchNextPage()
        }
    }, [
        productList.length,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isSearching,
    ])

    return {
        productList,
        isLoading: isLoading || isFetchingNextPage,
    }
}

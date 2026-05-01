import { useEffect, useMemo, useRef } from 'react'

import type { Product } from 'constants/integrations/types/shopify'
import { ProductStatus } from 'constants/integrations/types/shopify'
import { useListProducts } from 'models/integration/queries'
import type { IntegrationDataItem } from 'models/integration/types'

type useAIJourneyProductListParams = {
    integrationId?: number
    filter?: string
}

const MINIMUM_PRODUCT_COUNT = 5
const PICKER_STATUSES: ProductStatus[] = [ProductStatus.Active]
const MAX_PAGE_FETCHES = 3

export const useAIJourneyProductList = ({
    integrationId,
    filter,
}: useAIJourneyProductListParams) => {
    const isSearching = !!filter

    const {
        data: paginatedProductItems,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useListProducts(
        integrationId ?? 0,
        !!integrationId,
        {
            limit: 10,
            status: PICKER_STATUSES,
            ...(filter ? { filter } : {}),
        },
        {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            keepPreviousData: isSearching,
            retry: 3,
            retryDelay: 1000,
            queryKey: [
                'integration',
                'shopify',
                integrationId ?? 0,
                'products',
                'list',
                PICKER_STATUSES.join(','),
                filter ?? '',
            ],
        },
    )

    const productItemsData = paginatedProductItems?.pages?.reduce<
        IntegrationDataItem<Product>[]
    >((acc, page) => [...acc, ...page.data.data], [])

    const productList = useMemo<Product[]>(() => {
        const filtered = (productItemsData ?? [])
            .filter((item) => item.data.published_at !== null)
            .filter((item) => !!item.data.image && !!item.data.title)
            .map((item) => item.data)

        return isSearching ? filtered : filtered.slice(0, MINIMUM_PRODUCT_COUNT)
    }, [productItemsData, isSearching])

    const pageFetchCount = useRef(0)

    useEffect(() => {
        pageFetchCount.current = 0
    }, [integrationId])

    useEffect(() => {
        if (isSearching) return

        const needsMoreProducts = productList.length < MINIMUM_PRODUCT_COUNT
        const canFetchMore =
            hasNextPage &&
            !isLoading &&
            !isFetchingNextPage &&
            !isError &&
            pageFetchCount.current < MAX_PAGE_FETCHES

        if (needsMoreProducts && canFetchMore) {
            pageFetchCount.current++
            fetchNextPage()
        }
    }, [
        productList.length,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isSearching,
        isError,
    ])

    return {
        productList,
        isLoading,
        isError,
    }
}

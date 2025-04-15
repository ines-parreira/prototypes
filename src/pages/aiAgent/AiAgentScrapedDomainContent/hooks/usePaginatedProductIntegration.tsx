import { useCallback, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { Product } from 'constants/integrations/types/shopify'
import {
    ApiPaginationParams,
    ApiPaginationParamsWithFilter,
} from 'models/api/types'
import { fetchIntegrationProducts } from 'models/integration/resources'
import { IntegrationDataItem } from 'models/integration/types'

interface UsePaginatedProductIntegrationProps {
    integrationId: number
    initialParams?: ApiPaginationParams
    enabled?: boolean
}

interface UsePaginatedProductIntegrationReturn {
    items: IntegrationDataItem<Product>[]
    itemsData: Product[]
    isLoading: boolean
    isError: boolean
    searchTerm: string
    setSearchTerm: (term: string) => void
    fetchNext: () => void
    fetchPrev: () => void
    hasNextPage: boolean
    hasPrevPage: boolean
}

const integrationKeys = {
    products: (
        integrationId: number,
        params?: ApiPaginationParamsWithFilter,
    ) => ['integration', integrationId, 'product', params],
}

export const usePaginatedProductIntegration = ({
    integrationId,
    initialParams = {},
    enabled = true,
}: UsePaginatedProductIntegrationProps): UsePaginatedProductIntegrationReturn => {
    const [params, setParams] =
        useState<ApiPaginationParamsWithFilter>(initialParams)
    const [searchTerm, setSearchTerm] = useState<string>('')

    const queryKey = integrationKeys.products(integrationId, params)

    const {
        data: response,
        isLoading,
        isError,
    } = useQuery({
        queryKey,
        queryFn: () => fetchIntegrationProducts(integrationId, params),
        enabled,
    })

    const { data: products, meta: paginationMeta } = response?.data || {}
    const { next_cursor: nextCursor, prev_cursor: prevCursor } =
        paginationMeta || {}

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        setParams((prev) => ({ ...prev, cursor: undefined, filter: term }))
    }, [])

    const fetchNext = useCallback(() => {
        if (nextCursor) {
            setParams((prev) => ({ ...prev, cursor: nextCursor }))
        }
    }, [nextCursor])

    const fetchPrev = useCallback(() => {
        if (prevCursor) {
            setParams((prev) => ({ ...prev, cursor: prevCursor }))
        }
    }, [prevCursor])

    return {
        items: products || [],
        itemsData: products?.map((item) => item.data) || [],
        isLoading,
        isError,
        searchTerm,
        setSearchTerm: handleSearch,
        fetchNext,
        fetchPrev,
        hasNextPage: !!nextCursor,
        hasPrevPage: !!prevCursor,
    }
}

export default usePaginatedProductIntegration

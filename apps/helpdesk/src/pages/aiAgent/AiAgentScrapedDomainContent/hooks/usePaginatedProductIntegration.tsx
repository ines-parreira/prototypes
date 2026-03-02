import { useCallback, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import type {
    Product,
    ProductWithAiAgentStatus,
} from 'constants/integrations/types/shopify'
import { ProductStatus } from 'constants/integrations/types/shopify'
import type {
    ApiPaginationParams,
    ApiPaginationParamsWithFilter,
} from 'models/api/types'
import { fetchIntegrationProducts } from 'models/integration/resources'
import type { IntegrationDataItem } from 'models/integration/types'

interface UsePaginatedProductIntegrationProps {
    integrationId: number
    initialParams?: ApiPaginationParams
    enabled?: boolean
}
interface UsePaginatedProductIntegrationReturn {
    items: IntegrationDataItem<Product>[]
    itemsData: ProductWithAiAgentStatus[]
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

export const isProductExcludedFromAiAgent = (product: Product): boolean => {
    const DO_NOT_RECOMMEND_TAG = 'gorgias_do_not_recommend'

    return (
        product.status !== ProductStatus.Active ||
        product.variants?.length === 0 ||
        !product.published_at ||
        Boolean(product.tags && product.tags.includes(DO_NOT_RECOMMEND_TAG))
    )
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

    const itemsData: ProductWithAiAgentStatus[] = useMemo(() => {
        return (products || []).map((item) => ({
            ...item.data,
            is_used_by_ai_agent: !isProductExcludedFromAiAgent(item.data),
        }))
    }, [products])

    return useMemo(() => {
        return {
            items: products || [],
            itemsData,
            isLoading,
            isError,
            searchTerm,
            setSearchTerm: handleSearch,
            fetchNext,
            fetchPrev,
            hasNextPage: !!nextCursor,
            hasPrevPage: !!prevCursor,
        }
    }, [
        products,
        itemsData,
        isLoading,
        isError,
        searchTerm,
        handleSearch,
        fetchNext,
        fetchPrev,
        nextCursor,
        prevCursor,
    ])
}

export default usePaginatedProductIntegration

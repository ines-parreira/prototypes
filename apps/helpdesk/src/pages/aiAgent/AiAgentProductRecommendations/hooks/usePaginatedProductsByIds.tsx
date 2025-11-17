import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { useQuery } from '@tanstack/react-query'

import type { Product } from 'constants/integrations/types/shopify'
import { fetchIntegrationProducts as fetchIntegrationProductsByIds } from 'state/integrations/helpers'

interface UsePaginatedProductsByIdsProps {
    integrationId: number
    productIds: string[]
    pageSize?: number
    enabled?: boolean
    fetchAll?: boolean
}

interface UsePaginatedProductsByIdsReturn {
    allProducts: Product[]
    products: Product[]
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    currentPage: number
    totalPages: number
    fetchPage: (page: number) => void
    hasNextPage: boolean
    hasPrevPage: boolean
    searchTerm: string
    setSearchTerm: (term: string) => void
}

const integrationKeys = {
    productsByIds: (
        integrationId: number,
        productIds: string[],
        fetchAll?: boolean,
    ) => ['integration', integrationId, 'productsByIds', productIds, fetchAll],
}

// The API returns only 30 products per page, regardless of the limit parameter
const BATCH_SIZE = 30

const usePaginatedProductsByIds = ({
    integrationId,
    productIds,
    pageSize = 25,
    enabled = true,
    fetchAll = false,
}: UsePaginatedProductsByIdsProps): UsePaginatedProductsByIdsReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [allProducts, setAllProducts] = useState<Product[]>([])

    const debouncedSearchTerm = useDebouncedValue(searchTerm, 200)

    const queryKey = fetchAll
        ? integrationKeys.productsByIds(integrationId, productIds, fetchAll)
        : [
              ...integrationKeys.productsByIds(
                  integrationId,
                  productIds,
                  fetchAll,
              ),
              currentPage,
              pageSize,
          ]

    const fetchAllProductsInBatches = useCallback(async () => {
        if (productIds.length === 0) return []

        const results: Product[] = []
        const batches = Math.ceil(productIds.length / BATCH_SIZE)

        for (let i = 0; i < batches; i++) {
            const start = i * BATCH_SIZE
            const end = Math.min(start + BATCH_SIZE, productIds.length)
            const batchIds = productIds.slice(start, end)

            try {
                const batchResults = await fetchIntegrationProductsByIds(
                    integrationId,
                    batchIds.map(Number),
                )
                results.push(
                    ...(batchResults.map((r) => r.toJS()) as Product[]),
                )
            } catch (error) {
                console.error(`Failed to fetch batch ${i + 1}:`, error)
                throw error
            }
        }

        return results
    }, [integrationId, productIds])

    const fetchPaginatedProducts = useCallback(async () => {
        if (productIds.length === 0) return []

        const startIdx = (currentPage - 1) * pageSize
        const endIdx = startIdx + pageSize
        const paginatedIds = productIds.slice(startIdx, endIdx)

        if (paginatedIds.length === 0) return []

        const results = await fetchIntegrationProductsByIds(
            integrationId,
            paginatedIds.map(Number),
        )

        return results.map((r) => r.toJS()) as Product[]
    }, [integrationId, productIds, currentPage, pageSize])

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey,
        queryFn: fetchAll ? fetchAllProductsInBatches : fetchPaginatedProducts,
        enabled: enabled,
        staleTime: Infinity,
    })

    useEffect(() => {
        if (fetchAll && data) {
            setAllProducts(data as Product[])
        }
    }, [fetchAll, data])

    const filteredProducts = useMemo(() => {
        if (!fetchAll) {
            return (data as Product[]) || []
        }

        setCurrentPage(1)

        if (!debouncedSearchTerm) {
            return allProducts
        }

        const lowerSearchTerm = debouncedSearchTerm.toLowerCase()
        return allProducts.filter((product) =>
            product.title.toLowerCase().includes(lowerSearchTerm),
        )
    }, [fetchAll, data, allProducts, debouncedSearchTerm])

    const paginatedFilteredProducts = useMemo(() => {
        if (!fetchAll) {
            return filteredProducts
        }

        const startIdx = (currentPage - 1) * pageSize
        const endIdx = startIdx + pageSize
        return filteredProducts.slice(startIdx, endIdx)
    }, [fetchAll, filteredProducts, currentPage, pageSize])

    const totalPages = useMemo(() => {
        if (fetchAll) {
            return Math.ceil(filteredProducts.length / pageSize)
        }
        return Math.ceil(productIds.length / pageSize)
    }, [fetchAll, filteredProducts.length, productIds.length, pageSize])

    const fetchPage = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
    }, [])

    return useMemo(
        () => ({
            allProducts,
            products: paginatedFilteredProducts,
            isLoading,
            isFetching,
            isError,
            currentPage,
            totalPages,
            fetchPage,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            searchTerm,
            setSearchTerm: handleSearch,
        }),
        [
            allProducts,
            paginatedFilteredProducts,
            isLoading,
            isFetching,
            isError,
            currentPage,
            totalPages,
            fetchPage,
            searchTerm,
            handleSearch,
        ],
    )
}

export default usePaginatedProductsByIds

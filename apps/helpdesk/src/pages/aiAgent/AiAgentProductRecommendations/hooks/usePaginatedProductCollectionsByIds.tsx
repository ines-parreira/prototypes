import { useCallback, useMemo, useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { useQuery } from '@tanstack/react-query'

import { fetchEcommerceProductCollections } from 'models/ecommerce/resources'
import type { ProductCollection } from 'models/ecommerce/types'

interface Collection {
    id: string
    title: string
    productIds: string[]
}

interface UsePaginatedCollectionsByIdsProps {
    integrationId: number
    collectionIds: string[]
    enabled?: boolean
}

interface UsePaginatedCollectionsByIdsReturn {
    allCollections: Collection[]
    collections: Collection[]
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

const PAGE_SIZE = 25
// The API returns only 30 items per page, regardless of the limit parameter
const BATCH_SIZE = 30

const usePaginatedProductCollectionsByIds = ({
    integrationId,
    collectionIds,
    enabled = true,
}: UsePaginatedCollectionsByIdsProps): UsePaginatedCollectionsByIdsReturn => {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')

    const debouncedSearchTerm = useDebouncedValue(searchTerm, 200)

    const queryKey = [
        'integration',
        integrationId,
        'paginatedCollectionsByIds',
        collectionIds,
    ]

    const fetchAllCollectionsInBatches = useCallback(async () => {
        if (collectionIds.length === 0) return []

        const results: Collection[] = []
        const batches = Math.ceil(collectionIds.length / BATCH_SIZE)

        for (let i = 0; i < batches; i++) {
            const start = i * BATCH_SIZE
            const end = Math.min(start + BATCH_SIZE, collectionIds.length)
            const batchIds = collectionIds.slice(start, end)

            try {
                const response = await fetchEcommerceProductCollections(
                    integrationId,
                    {
                        external_ids: batchIds,
                    },
                )
                // Map ProductCollection to our simplified Collection interface
                const mappedCollections = response.data.data.map(
                    (collection: ProductCollection) => ({
                        id: collection.external_id,
                        title: collection.data.title,
                        productIds:
                            collection.indexed_data_fields
                                ?.product_external_ids ?? [],
                    }),
                )
                results.push(...mappedCollections)
            } catch (error) {
                console.error(`Failed to fetch batch ${i + 1}:`, error)
                throw error
            }
        }

        return results
    }, [integrationId, collectionIds])

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey,
        queryFn: fetchAllCollectionsInBatches,
        enabled,
        staleTime: Infinity,
    })

    const allCollections = useMemo(() => {
        return (data as Collection[]) || []
    }, [data])

    const filteredCollections = useMemo(() => {
        if (!debouncedSearchTerm) {
            return allCollections
        }

        const lowerSearchTerm = debouncedSearchTerm.toLowerCase()
        return allCollections.filter((collection) =>
            collection.title.toLowerCase().includes(lowerSearchTerm),
        )
    }, [allCollections, debouncedSearchTerm])

    const paginatedCollections = useMemo(() => {
        const startIdx = (currentPage - 1) * PAGE_SIZE
        const endIdx = startIdx + PAGE_SIZE
        return filteredCollections.slice(startIdx, endIdx)
    }, [filteredCollections, currentPage])

    const totalPages = useMemo(() => {
        return Math.ceil(filteredCollections.length / PAGE_SIZE)
    }, [filteredCollections.length])

    const fetchPage = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        setCurrentPage(1) // Reset to first page when searching
    }, [])

    return useMemo(
        () => ({
            allCollections,
            collections: paginatedCollections,
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
            allCollections,
            paginatedCollections,
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

export default usePaginatedProductCollectionsByIds

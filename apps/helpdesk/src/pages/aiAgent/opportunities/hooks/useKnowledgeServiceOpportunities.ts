import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    queryKeys,
    useFindOpportunitiesByShopOpportunity,
} from '@gorgias/knowledge-service-queries'

import type { OpportunityListItem } from '../types'
import { mapKnowledgeServiceOpportunities } from '../utils/mapKnowledgeServiceOpportunities'

export const OPPORTUNITIES_PAGE_SIZE = 20

interface PaginatedPage {
    opportunities: OpportunityListItem[]
    nextCursor: string | null
    prevCursor: string | null
    total: number
    totalPending: number
}

export const useKnowledgeServiceOpportunities = (
    shopIntegrationId: number,
    enabled: boolean,
) => {
    const [pages, setPages] = useState<PaginatedPage[]>([])
    const [currentCursor, setCurrentCursor] = useState<string | undefined>(
        undefined,
    )
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const { data, isLoading, isError, refetch } =
        useFindOpportunitiesByShopOpportunity(
            shopIntegrationId,
            {
                limit: OPPORTUNITIES_PAGE_SIZE,
                cursor: currentCursor,
            },
            {
                query: {
                    queryKey: [
                        ...queryKeys.opportunities.findOpportunitiesByShopOpportunity(
                            shopIntegrationId,
                        ),
                        'paginated',
                        currentCursor || 'initial',
                    ],
                    enabled: enabled && shopIntegrationId !== undefined,
                    refetchOnWindowFocus: false,
                },
            },
        )

    useEffect(() => {
        if (isError) {
            setIsLoadingMore(false)
        }
    }, [isError])

    useEffect(() => {
        if (!data?.data) {
            return
        }

        const paginatedData = data.data
        const newPage: PaginatedPage = {
            opportunities: mapKnowledgeServiceOpportunities(paginatedData),
            nextCursor: paginatedData.metadata.next_cursor,
            prevCursor: paginatedData.metadata.prev_cursor,
            total: paginatedData.metadata.total,
            totalPending: paginatedData.metadata.total_pending,
        }

        setPages((prevPages) => {
            if (!currentCursor) {
                return [newPage]
            }

            const isDuplicate = prevPages.some(
                (page) =>
                    page.nextCursor === newPage.nextCursor &&
                    page.prevCursor === newPage.prevCursor,
            )

            if (isDuplicate) {
                return prevPages
            }

            return [...prevPages, newPage]
        })

        setIsLoadingMore(false)
    }, [data?.data, currentCursor])

    const opportunities = useMemo(() => {
        return pages.flatMap((page) => page.opportunities)
    }, [pages])

    const totalCount = pages[0]?.total
    const totalPending = pages[0]?.totalPending
    const hasNextPage =
        pages.length > 0 && pages[pages.length - 1]?.nextCursor !== null
    const isFetchingNextPage = isLoadingMore

    const fetchNextPage = useCallback(() => {
        const lastPage = pages[pages.length - 1]
        if (!lastPage?.nextCursor || isLoadingMore) return

        setIsLoadingMore(true)
        setCurrentCursor(lastPage.nextCursor)
    }, [pages, isLoadingMore])

    const preloadNextPage = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const refetchFromStart = useCallback(async () => {
        setPages([])
        setCurrentCursor(undefined)
        await refetch()
    }, [refetch])

    return {
        opportunities,
        isLoading: isLoading && pages.length === 0,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        preloadNextPage,
        totalCount,
        totalPending,
        refetch: refetchFromStart,
    }
}

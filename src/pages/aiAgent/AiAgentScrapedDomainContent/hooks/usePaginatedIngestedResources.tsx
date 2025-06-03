import { useCallback, useMemo, useState } from 'react'

import { useListIngestedResources } from 'models/helpCenter/queries'

import { PAGINATED_ITEMS_PER_PAGE } from '../constant'
import { IngestedResourceWithArticleId } from '../types'

interface UsePaginatedIngestedResourceProps {
    helpCenterId: number
    ingestionLogId: number
    enabled?: boolean
}

interface UsePaginatedIngestedResourceReturn {
    contents: IngestedResourceWithArticleId[]
    isLoading: boolean
    isError: boolean
    searchTerm: string
    setSearchTerm: (term: string) => void
    fetchNext: () => void
    fetchPrev: () => void
    hasNextPage: boolean
    hasPrevPage: boolean
}

export const usePaginatedIngestedResources = ({
    helpCenterId,
    ingestionLogId,
    enabled = true,
}: UsePaginatedIngestedResourceProps): UsePaginatedIngestedResourceReturn => {
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)

    const {
        data: response,
        isLoading,
        isError,
    } = useListIngestedResources(
        {
            help_center_id: helpCenterId,
            article_ingestion_log_id: ingestionLogId,
        },
        {
            page: currentPage,
            per_page: PAGINATED_ITEMS_PER_PAGE,
            filter: searchTerm,
        },
        {
            enabled,
        },
    )

    const { data: ingestedResources, meta: pageMeta } = response || {}

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }, [])

    const handleFetchNext = useCallback(() => {
        if (pageMeta?.next_page) {
            setCurrentPage((page) => page + 1)
        }
    }, [pageMeta?.next_page])

    const handleFetchPrev = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage((page) => page - 1)
        }
    }, [currentPage])

    const transformedResources: IngestedResourceWithArticleId[] = useMemo(
        () =>
            (ingestedResources || []).map((resource) => ({
                ...resource,
                web_pages: (resource.web_pages as any[]).map((page) => ({
                    url: page.url,
                    title: page.title,
                    pageType: page.pageType,
                })),
            })),
        [ingestedResources],
    )

    return useMemo(() => {
        return {
            contents: transformedResources,
            isLoading,
            isError,
            searchTerm,
            setSearchTerm: handleSearch,
            fetchNext: handleFetchNext,
            fetchPrev: handleFetchPrev,
            hasNextPage: !!pageMeta?.next_page,
            hasPrevPage: currentPage > 1,
        }
    }, [
        transformedResources,
        isLoading,
        isError,
        searchTerm,
        handleSearch,
        handleFetchNext,
        handleFetchPrev,
        pageMeta?.next_page,
        currentPage,
    ])
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DurationInMs } from '@repo/utils'

import type { searchTickets } from '@gorgias/helpdesk-client'
import { useSearchTickets } from '@gorgias/helpdesk-queries'
import type {
    TicketCompact,
    TicketHighlightDataItem,
} from '@gorgias/helpdesk-types'

import {
    parseSortOrder,
    SORT_FIELDS,
} from '../components/TicketListHeader/SortOrderDropdown'
import type { SearchTicket } from '../types/search'
import type { SearchTracking } from '../types/searchTracking'
import { getSearchTotalResources } from '../utils/getSearchTotalResources'
import { toSearchTicketsOrderBy } from '../utils/search'
import { useSortOrder } from './useSortOrder'
import { useTicketsList } from './useTicketsList'

export type DirtyViewInput = {
    enabled: boolean
    search: string
    filters: string
    areFiltersValid: boolean
}

type DirtyTicketsResponse = {
    data: TicketCompact[]
    meta?: {
        next_cursor?: string | null
        prev_cursor?: string | null
        total_resources?: number | null
    } | null
}

type SearchViewInput = {
    enabled: boolean
    query: string
    filters: string
    cursor?: string
    setCursor: (cursor?: string) => void
}

type Props = {
    viewId: number
    dirtyView?: DirtyViewInput
    searchView?: SearchViewInput
    enablePersistedUpdates: boolean
    pauseUpdates: boolean
    isDraftView?: boolean
    searchTracking?: SearchTracking
}

type TicketTableDataState = {
    items: TicketCompact[]
    isLoading: boolean
    hasNextPage: boolean
    hasPreviousPage: boolean
    totalResources?: number
    error: unknown
}

type PageChangeHandler = (direction: 'next' | 'previous') => void
type RefreshHandler = () => void

function normalizeSearchTicketItems(
    items: unknown[] | undefined,
): SearchTicket[] {
    return (items ?? []).flatMap((item) => {
        const ticketItem = item as TicketHighlightDataItem &
            Partial<SearchTicket>

        if (ticketItem.entity) {
            return [
                {
                    ...(ticketItem.entity as SearchTicket),
                    highlights: ticketItem.highlights,
                },
            ]
        }

        if (!('id' in ticketItem)) {
            return []
        }

        return [ticketItem as SearchTicket]
    })
}

export function useTicketTableData({
    viewId,
    dirtyView,
    searchView,
    enablePersistedUpdates,
    pauseUpdates,
    isDraftView = false,
    searchTracking,
}: Props) {
    const [sortOrder, setSortOrder] = useSortOrder(viewId, { isDraftView })
    const [pageSize, setPageSize] = useState(20)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [dirtyCursor, setDirtyCursor] = useState<string | undefined>()
    const [lastValidDirtyResponse, setLastValidDirtyResponse] =
        useState<DirtyTicketsResponse | null>(null)
    const requestedPersistedPageIndexRef = useRef<number | null>(null)
    const searchResetKeyRef = useRef<string | null>(null)
    const pendingSearchTrackingRequestRef = useRef<{
        query: string
        requestTime: number
    } | null>(null)
    const isSearchFetchInFlightRef = useRef(false)

    const isDirtyMode = dirtyView?.enabled ?? false
    const isSearchMode = searchView?.enabled ?? false
    const usesSearchQuery = isDraftView || isDirtyMode || isSearchMode
    const searchCursor = searchView?.cursor
    const searchFilters = searchView?.filters ?? ''
    const searchTerm = searchView?.query ?? ''
    const setSearchCursor = searchView?.setCursor

    const persistedParams = useMemo(
        () => ({ order_by: sortOrder, limit: pageSize }),
        [pageSize, sortOrder],
    )

    const persisted = useTicketsList(viewId, {
        params: persistedParams,
        pauseUpdates,
        enableStaleUpdates: enablePersistedUpdates,
        enabled: !usesSearchQuery,
    })

    const dirtyQuery = useSearchTickets<DirtyTicketsResponse>(
        {
            search: dirtyView?.search ?? '',
            filters: dirtyView?.filters ?? '',
        },
        {
            order_by: sortOrder,
            cursor: dirtyCursor,
            limit: pageSize,
            track_total_hits: true,
        },
        {
            query: {
                enabled:
                    (isDraftView || isDirtyMode) &&
                    (dirtyView?.areFiltersValid ?? false),
                refetchOnWindowFocus: false,
                staleTime: DurationInMs.FiveSeconds,
                select: (response) => ({
                    data: (response.data.data ?? []) as TicketCompact[],
                    meta: response.data.meta,
                }),
            },
        },
    )

    const searchQuery = useSearchTickets<
        Awaited<ReturnType<typeof searchTickets>>
    >(
        {
            search: searchTerm,
            filters: searchFilters,
        },
        {
            order_by: toSearchTicketsOrderBy(sortOrder),
            cursor: searchCursor,
            limit: pageSize,
            with_highlights: true,
            track_total_hits: true,
        },
        {
            query: {
                enabled: isSearchMode,
                refetchOnWindowFocus: false,
                staleTime: DurationInMs.FiveSeconds,
            },
        },
    )

    useEffect(() => {
        const shouldTrackInitialSearchRequest =
            isSearchMode && searchCursor === undefined

        if (!shouldTrackInitialSearchRequest) {
            isSearchFetchInFlightRef.current = searchQuery.isFetching
            return
        }

        if (searchQuery.isFetching && !isSearchFetchInFlightRef.current) {
            const request = {
                query: searchTerm,
                requestTime: Date.now(),
            }

            pendingSearchTrackingRequestRef.current = request
            searchTracking?.onRequest?.(request)
        }

        const didSearchFetchFinish =
            !searchQuery.isFetching && isSearchFetchInFlightRef.current

        if (
            didSearchFetchFinish &&
            pendingSearchTrackingRequestRef.current &&
            searchQuery.data
        ) {
            searchTracking?.onResponse?.({
                responseTime: Date.now(),
                numberOfResults: searchQuery.data.data.data?.length ?? 0,
                searchEngine:
                    searchQuery.data.headers?.['x-gorgias-search-engine'],
            })
            pendingSearchTrackingRequestRef.current = null
        }

        isSearchFetchInFlightRef.current = searchQuery.isFetching
    }, [
        isSearchMode,
        searchCursor,
        searchQuery.data,
        searchQuery.isFetching,
        searchTerm,
        searchTracking,
    ])

    useEffect(() => {
        if (!isDraftView && !isDirtyMode) {
            setDirtyCursor(undefined)
            setLastValidDirtyResponse(null)
            return
        }

        requestedPersistedPageIndexRef.current = null
        setCurrentPageIndex(0)
        setDirtyCursor(undefined)
    }, [
        dirtyView?.filters,
        dirtyView?.search,
        isDirtyMode,
        isDraftView,
        pageSize,
        sortOrder,
    ])

    useEffect(() => {
        if (!isSearchMode) {
            searchResetKeyRef.current = null
            return
        }

        const searchResetKey = [
            pageSize,
            searchFilters,
            searchTerm,
            sortOrder,
        ].join('::')

        if (searchResetKeyRef.current === searchResetKey) {
            return
        }

        searchResetKeyRef.current = searchResetKey
        requestedPersistedPageIndexRef.current = null
        setCurrentPageIndex(0)

        if (searchCursor !== undefined) {
            setSearchCursor?.(undefined)
        }
    }, [
        isSearchMode,
        pageSize,
        searchFilters,
        searchTerm,
        searchCursor,
        setSearchCursor,
        sortOrder,
    ])

    useEffect(() => {
        if (dirtyQuery.data && dirtyView?.areFiltersValid) {
            setLastValidDirtyResponse(dirtyQuery.data)
        }
    }, [dirtyQuery.data, dirtyView?.areFiltersValid])

    const persistedItems = useMemo(
        () =>
            persisted.tickets.slice(
                currentPageIndex * pageSize,
                (currentPageIndex + 1) * pageSize,
            ),
        [currentPageIndex, pageSize, persisted.tickets],
    )

    const activeDirtyResponse = dirtyView?.areFiltersValid
        ? (dirtyQuery.data ?? lastValidDirtyResponse)
        : lastValidDirtyResponse

    const shouldRenderDirtyData =
        (isDraftView || isDirtyMode) &&
        (dirtyView?.areFiltersValid ?? false) &&
        activeDirtyResponse != null

    useEffect(() => {
        const requestedPersistedPageIndex =
            requestedPersistedPageIndexRef.current

        if (
            shouldRenderDirtyData ||
            requestedPersistedPageIndex == null ||
            persisted.isFetchingNextPage
        ) {
            return
        }

        const nextPageStart = requestedPersistedPageIndex * pageSize

        if (nextPageStart < persisted.tickets.length) {
            setCurrentPageIndex(requestedPersistedPageIndex)
            requestedPersistedPageIndexRef.current = null
        }
    }, [
        pageSize,
        persisted.isFetchingNextPage,
        persisted.tickets.length,
        shouldRenderDirtyData,
    ])

    const persistedState = useMemo<TicketTableDataState>(
        () => ({
            items: persistedItems,
            isLoading: persisted.isLoading || persisted.isFetchingNextPage,
            hasNextPage:
                (currentPageIndex + 1) * pageSize < persisted.tickets.length ||
                !!persisted.hasNextPage,
            hasPreviousPage: currentPageIndex > 0,
            totalResources: undefined,
            error: persisted.error,
        }),
        [
            currentPageIndex,
            pageSize,
            persisted.error,
            persisted.hasNextPage,
            persisted.isFetchingNextPage,
            persisted.isLoading,
            persisted.tickets.length,
            persistedItems,
        ],
    )

    const dirtyState = useMemo<TicketTableDataState>(
        () => ({
            items: activeDirtyResponse?.data ?? persistedItems,
            isLoading: dirtyQuery.isLoading && !activeDirtyResponse,
            hasNextPage: !!activeDirtyResponse?.meta?.next_cursor,
            hasPreviousPage: !!activeDirtyResponse?.meta?.prev_cursor,
            totalResources:
                activeDirtyResponse?.meta?.total_resources ?? undefined,
            error: dirtyQuery.error,
        }),
        [
            activeDirtyResponse,
            dirtyQuery.error,
            dirtyQuery.isLoading,
            persistedItems,
        ],
    )

    const searchState = useMemo<TicketTableDataState>(
        () => ({
            items: normalizeSearchTicketItems(searchQuery.data?.data.data),
            isLoading: searchQuery.isLoading,
            hasNextPage: !!searchQuery.data?.data.meta?.next_cursor,
            hasPreviousPage: !!searchQuery.data?.data.meta?.prev_cursor,
            totalResources: getSearchTotalResources(
                searchQuery.data?.data.meta,
            ),
            error: searchQuery.error,
        }),
        [searchQuery.data, searchQuery.error, searchQuery.isLoading],
    )

    const activeState = isSearchMode
        ? searchState
        : shouldRenderDirtyData
          ? dirtyState
          : persistedState

    const handleSearchPageChange = useCallback<PageChangeHandler>(
        (direction: 'next' | 'previous') => {
            const nextCursor =
                direction === 'next'
                    ? searchQuery.data?.data.meta?.next_cursor
                    : searchQuery.data?.data.meta?.prev_cursor

            if (!nextCursor) {
                return
            }

            setCurrentPageIndex((index) =>
                direction === 'next' ? index + 1 : Math.max(0, index - 1),
            )
            setSearchCursor?.(nextCursor ?? undefined)
        },
        [
            searchQuery.data?.data.meta?.next_cursor,
            searchQuery.data?.data.meta?.prev_cursor,
            setSearchCursor,
        ],
    )

    const handleDirtyPageChange = useCallback<PageChangeHandler>(
        (direction: 'next' | 'previous') => {
            const nextCursor =
                direction === 'next'
                    ? activeDirtyResponse?.meta?.next_cursor
                    : activeDirtyResponse?.meta?.prev_cursor

            if (!nextCursor) {
                return
            }

            setCurrentPageIndex((index) =>
                direction === 'next' ? index + 1 : Math.max(0, index - 1),
            )
            setDirtyCursor(nextCursor ?? undefined)
        },
        [
            activeDirtyResponse?.meta?.next_cursor,
            activeDirtyResponse?.meta?.prev_cursor,
        ],
    )

    const handlePersistedPageChange = useCallback<PageChangeHandler>(
        (direction: 'next' | 'previous') => {
            if (direction === 'previous') {
                requestedPersistedPageIndexRef.current = null
                setCurrentPageIndex((index) => Math.max(0, index - 1))
                return
            }

            const nextPageStart = (currentPageIndex + 1) * pageSize
            if (nextPageStart < persisted.tickets.length) {
                requestedPersistedPageIndexRef.current = null
                setCurrentPageIndex((index) => index + 1)
            } else if (persisted.hasNextPage && !persisted.isFetchingNextPage) {
                requestedPersistedPageIndexRef.current = currentPageIndex + 1
                void persisted.fetchNextPage()
            }
        },
        [currentPageIndex, pageSize, persisted],
    )

    const handlePageChange: PageChangeHandler = isSearchMode
        ? handleSearchPageChange
        : shouldRenderDirtyData
          ? handleDirtyPageChange
          : handlePersistedPageChange

    const handlePageSizeChange = useCallback(
        (size: number) => {
            requestedPersistedPageIndexRef.current = null
            setPageSize(size)
            setCurrentPageIndex(0)
            setDirtyCursor(undefined)
            setSearchCursor?.(undefined)
        },
        [setSearchCursor],
    )

    const handleSortChange = useCallback(
        (
            updaterOrValue:
                | Array<{ id: string; desc: boolean }>
                | ((
                      old: Array<{ id: string; desc: boolean }>,
                  ) => Array<{ id: string; desc: boolean }>),
        ) => {
            const { field: currentField, direction: currentDirection } =
                parseSortOrder(sortOrder)
            const currentSortingState = currentField
                ? [{ id: currentField.id, desc: currentDirection === 'desc' }]
                : []

            const nextSortingState =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(currentSortingState)
                    : updaterOrValue

            const [firstSort] = nextSortingState
            if (!firstSort) {
                return
            }

            const field = SORT_FIELDS.find(
                (sortField) => sortField.id === firstSort.id,
            )
            if (!field) {
                return
            }

            setSortOrder(firstSort.desc ? field.desc : field.asc)
            requestedPersistedPageIndexRef.current = null
            setCurrentPageIndex(0)
            setDirtyCursor(undefined)
            setSearchCursor?.(undefined)
        },
        [setSearchCursor, setSortOrder, sortOrder],
    )

    const refreshSearch = useCallback<RefreshHandler>(() => {
        void searchQuery.refetch()
    }, [searchQuery])

    const refreshDirty = useCallback<RefreshHandler>(() => {
        if (!dirtyView?.areFiltersValid) {
            return
        }

        void dirtyQuery.refetch()
    }, [dirtyQuery, dirtyView?.areFiltersValid])

    const refreshPersisted = useCallback<RefreshHandler>(() => {
        void persisted.refetch()
    }, [persisted])

    const refresh: RefreshHandler = isSearchMode
        ? refreshSearch
        : shouldRenderDirtyData ||
            ((isDraftView || isDirtyMode) && dirtyView?.areFiltersValid)
          ? refreshDirty
          : refreshPersisted

    return {
        ...activeState,
        currentPageIndex,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onSortChange: handleSortChange,
        onRefresh: refresh,
        pageSize,
        sortOrder,
    }
}

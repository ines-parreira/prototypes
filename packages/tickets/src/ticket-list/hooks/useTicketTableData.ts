import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

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
    /** Current pageIndex from the DataTable, mirrored by the caller. */
    pageIndex: number
    /** Current pageSize from the DataTable, mirrored by the caller. */
    pageSize: number
    /** Prevents data requests until the DataTable has resolved persisted state. */
    enabled?: boolean
    /**
     * Called when filter / search / sort changes invalidate the current pageIndex.
     * The caller is expected to nudge the DataTable mirror back to pageIndex 0.
     */
    onPaginationReset: () => void
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
    pageIndex,
    pageSize,
    enabled = true,
    onPaginationReset,
    dirtyView,
    searchView,
    enablePersistedUpdates,
    pauseUpdates,
    isDraftView = false,
    searchTracking,
}: Props) {
    const [sortOrder, setSortOrder] = useSortOrder(viewId, { isDraftView })
    const [dirtyCursor, setDirtyCursor] = useState<string | undefined>()
    const [lastValidDirtyResponse, setLastValidDirtyResponse] =
        useState<DirtyTicketsResponse | null>(null)
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
        enabled: enabled && !usesSearchQuery,
    })
    const {
        tickets: persistedTickets,
        isLoading: persistedIsLoading,
        isFetchingNextPage: persistedIsFetchingNextPage,
        hasNextPage: persistedHasNextPage,
        fetchNextPage: fetchPersistedNextPage,
        refetch: refetchPersisted,
        error: persistedError,
    } = persisted

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
                    enabled &&
                    (isDraftView || isDirtyMode) &&
                    (dirtyView?.areFiltersValid ?? false),
                refetchOnWindowFocus: false,
                staleTime: Duration.seconds(5),
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
                enabled: enabled && isSearchMode,
                refetchOnWindowFocus: false,
                staleTime: Duration.seconds(5),
            },
        },
    )

    useEffect(() => {
        if (!enabled) {
            return
        }

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
        enabled,
        isSearchMode,
        searchCursor,
        searchQuery.data,
        searchQuery.isFetching,
        searchTerm,
        searchTracking,
    ])

    useEffect(() => {
        if (!enabled) {
            return
        }

        if (!isDraftView && !isDirtyMode) {
            setDirtyCursor(undefined)
            setLastValidDirtyResponse(null)
            return
        }

        setDirtyCursor(undefined)
        onPaginationReset()
    }, [
        dirtyView?.filters,
        dirtyView?.search,
        enabled,
        isDirtyMode,
        isDraftView,
        onPaginationReset,
        pageSize,
        sortOrder,
    ])

    useEffect(() => {
        if (!enabled) {
            return
        }

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
        onPaginationReset()

        if (searchCursor !== undefined) {
            setSearchCursor?.(undefined)
        }
    }, [
        enabled,
        isSearchMode,
        onPaginationReset,
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

    // The persisted (non-search/non-dirty) flow keeps an in-memory infinite
    // list and slices the current page out of it.
    const persistedPageStart = pageIndex * pageSize
    const persistedPageEnd = (pageIndex + 1) * pageSize
    const needsPersistedPageFetch =
        enabled &&
        !usesSearchQuery &&
        persistedPageEnd > persistedTickets.length &&
        !!persistedHasNextPage

    useEffect(() => {
        if (
            !needsPersistedPageFetch ||
            persistedIsFetchingNextPage ||
            persistedIsLoading
        ) {
            return
        }

        void fetchPersistedNextPage()
    }, [
        fetchPersistedNextPage,
        needsPersistedPageFetch,
        persistedIsFetchingNextPage,
        persistedIsLoading,
    ])

    const persistedItems = useMemo(
        () => persistedTickets.slice(persistedPageStart, persistedPageEnd),
        [persistedTickets, persistedPageEnd, persistedPageStart],
    )

    const activeDirtyResponse = dirtyView?.areFiltersValid
        ? (dirtyQuery.data ?? lastValidDirtyResponse)
        : lastValidDirtyResponse

    const shouldRenderDirtyData =
        (isDraftView || isDirtyMode) &&
        (dirtyView?.areFiltersValid ?? false) &&
        activeDirtyResponse != null

    const persistedState = useMemo<TicketTableDataState>(
        () => ({
            items: persistedItems,
            isLoading:
                persistedIsLoading ||
                persistedIsFetchingNextPage ||
                needsPersistedPageFetch,
            hasNextPage:
                persistedPageEnd < persistedTickets.length ||
                !!persistedHasNextPage,
            hasPreviousPage: pageIndex > 0,
            totalResources: undefined,
            error: persistedError,
        }),
        [
            pageIndex,
            persistedError,
            persistedHasNextPage,
            persistedIsFetchingNextPage,
            persistedIsLoading,
            persistedTickets.length,
            persistedPageEnd,
            persistedItems,
            needsPersistedPageFetch,
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

    const unresolvedState = useMemo<TicketTableDataState>(
        () => ({
            items: [],
            isLoading: true,
            hasNextPage: false,
            hasPreviousPage: false,
            totalResources: undefined,
            error: null,
        }),
        [],
    )

    const activeState = !enabled
        ? unresolvedState
        : isSearchMode
          ? searchState
          : shouldRenderDirtyData
            ? dirtyState
            : persistedState

    // Cursor-based mode handlers only update their cursor — the DataTable
    // owns pageIndex and bumps it internally via table.nextPage() / .previousPage().
    const handleSearchPageChange = useCallback<PageChangeHandler>(
        (direction: 'next' | 'previous') => {
            const nextCursor =
                direction === 'next'
                    ? searchQuery.data?.data.meta?.next_cursor
                    : searchQuery.data?.data.meta?.prev_cursor

            if (!nextCursor) return
            setSearchCursor?.(nextCursor)
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

            if (!nextCursor) return
            setDirtyCursor(nextCursor)
        },
        [
            activeDirtyResponse?.meta?.next_cursor,
            activeDirtyResponse?.meta?.prev_cursor,
        ],
    )

    // Persisted mode: when the user clicks "next" past the in-memory cache,
    // kick off the next batch fetch. The DataTable bumps pageIndex
    // immediately; the slice is briefly empty and `isFetchingNextPage` keeps
    // the table in its loading state until the new page arrives.
    const handlePersistedPageChange = useCallback<PageChangeHandler>(
        (direction: 'next' | 'previous') => {
            if (direction !== 'next') return
            const nextPageStart = (pageIndex + 1) * pageSize
            if (
                nextPageStart >= persistedTickets.length &&
                persistedHasNextPage &&
                !persistedIsFetchingNextPage
            ) {
                void fetchPersistedNextPage()
            }
        },
        [
            fetchPersistedNextPage,
            pageIndex,
            pageSize,
            persistedHasNextPage,
            persistedIsFetchingNextPage,
            persistedTickets.length,
        ],
    )

    const handlePageChange: PageChangeHandler = isSearchMode
        ? handleSearchPageChange
        : shouldRenderDirtyData
          ? handleDirtyPageChange
          : handlePersistedPageChange

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

            const nextSortOrder = firstSort.desc ? field.desc : field.asc
            if (nextSortOrder === sortOrder) {
                return
            }

            setSortOrder(nextSortOrder)
            setDirtyCursor(undefined)
            setSearchCursor?.(undefined)
            onPaginationReset()
        },
        [onPaginationReset, setSearchCursor, setSortOrder, sortOrder],
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
        void refetchPersisted()
    }, [refetchPersisted])

    const refresh: RefreshHandler = isSearchMode
        ? refreshSearch
        : shouldRenderDirtyData ||
            ((isDraftView || isDirtyMode) && dirtyView?.areFiltersValid)
          ? refreshDirty
          : refreshPersisted

    return {
        ...activeState,
        onPageChange: handlePageChange,
        onSortChange: handleSortChange,
        onRefresh: refresh,
        sortOrder,
    }
}

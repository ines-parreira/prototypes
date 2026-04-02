import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DurationInMs } from '@repo/utils'

import { useSearchTickets } from '@gorgias/helpdesk-queries'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import {
    parseSortOrder,
    SORT_FIELDS,
} from '../components/TicketListHeader/SortOrderDropdown'
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
    } | null
}

type Props = {
    viewId: number
    dirtyView?: DirtyViewInput
    enablePersistedUpdates: boolean
    pauseUpdates: boolean
}

export function useTicketTableData({
    viewId,
    dirtyView,
    enablePersistedUpdates,
    pauseUpdates,
}: Props) {
    const [sortOrder, setSortOrder] = useSortOrder(viewId)
    const [pageSize, setPageSize] = useState(20)
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [dirtyCursor, setDirtyCursor] = useState<string | undefined>()
    const [lastValidDirtyResponse, setLastValidDirtyResponse] =
        useState<DirtyTicketsResponse | null>(null)
    const requestedPersistedPageIndexRef = useRef<number | null>(null)

    const isDirtyMode = dirtyView?.enabled ?? false

    const persistedParams = useMemo(
        () => ({ order_by: sortOrder, limit: pageSize }),
        [pageSize, sortOrder],
    )

    const persisted = useTicketsList(viewId, {
        params: persistedParams,
        pauseUpdates,
        enableStaleUpdates: enablePersistedUpdates,
        enabled: !isDirtyMode,
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
                enabled: isDirtyMode && (dirtyView?.areFiltersValid ?? false),
                refetchOnWindowFocus: false,
                staleTime: DurationInMs.FiveSeconds,
                select: (response) => ({
                    data: (response.data.data ?? []) as TicketCompact[],
                    meta: response.data.meta,
                }),
            },
        },
    )

    useEffect(() => {
        if (!isDirtyMode) {
            setDirtyCursor(undefined)
            setLastValidDirtyResponse(null)
            return
        }

        requestedPersistedPageIndexRef.current = null
        setDirtyCursor(undefined)
    }, [
        dirtyView?.filters,
        dirtyView?.search,
        isDirtyMode,
        pageSize,
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
        isDirtyMode && dirtyView?.areFiltersValid && activeDirtyResponse != null

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

    const items = shouldRenderDirtyData
        ? activeDirtyResponse.data
        : persistedItems

    const isLoading = shouldRenderDirtyData
        ? dirtyQuery.isLoading && !activeDirtyResponse
        : persisted.isLoading || persisted.isFetchingNextPage

    const hasNextPage = shouldRenderDirtyData
        ? !!activeDirtyResponse?.meta?.next_cursor
        : (currentPageIndex + 1) * pageSize < persisted.tickets.length ||
          !!persisted.hasNextPage

    const hasPreviousPage = shouldRenderDirtyData
        ? !!activeDirtyResponse?.meta?.prev_cursor
        : currentPageIndex > 0

    const handlePageChange = useCallback(
        (direction: 'next' | 'previous') => {
            if (shouldRenderDirtyData) {
                const nextCursor =
                    direction === 'next'
                        ? activeDirtyResponse?.meta?.next_cursor
                        : activeDirtyResponse?.meta?.prev_cursor

                setDirtyCursor(nextCursor ?? undefined)
                return
            }

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
        [
            activeDirtyResponse?.meta?.next_cursor,
            activeDirtyResponse?.meta?.prev_cursor,
            currentPageIndex,
            pageSize,
            persisted,
            shouldRenderDirtyData,
        ],
    )

    const handlePageSizeChange = useCallback((size: number) => {
        requestedPersistedPageIndexRef.current = null
        setPageSize(size)
        setCurrentPageIndex(0)
        setDirtyCursor(undefined)
    }, [])

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
        },
        [setSortOrder, sortOrder],
    )

    const refresh = useCallback(() => {
        if (
            shouldRenderDirtyData ||
            (isDirtyMode && dirtyView?.areFiltersValid)
        ) {
            if (!dirtyView?.areFiltersValid) {
                return
            }
            void dirtyQuery.refetch()
            return
        }

        void persisted.refetch()
    }, [
        dirtyQuery,
        dirtyView?.areFiltersValid,
        isDirtyMode,
        persisted,
        shouldRenderDirtyData,
    ])

    return {
        items,
        isLoading,
        hasNextPage,
        hasPreviousPage,
        currentPageIndex,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onSortChange: handleSortChange,
        onRefresh: refresh,
        pageSize,
        sortOrder,
        error: shouldRenderDirtyData ? dirtyQuery.error : persisted.error,
    }
}

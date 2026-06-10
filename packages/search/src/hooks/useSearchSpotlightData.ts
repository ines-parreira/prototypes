import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useDebouncedValue } from '@gorgias/toolkit-react'

import {
    useSearchAllCustomers,
    useSearchAllTickets,
} from '@gorgias/helpdesk-queries'

import { SEARCH_RESULT_LIMIT } from '../constants'
import type { RawSearchItem } from '../types'
import {
    extractResponseData,
    toCallRow,
    toCustomerRow,
    toTicketRow,
    toTotalCount,
} from '../utils'
import { useInfiniteVoiceCallSearch } from './useInfiniteVoiceCallSearch'

type UseSearchSpotlightDataOptions = {
    query: string
    isOpen: boolean
    showCalls: boolean
}

type SpotlightPaginationState = {
    hasNextPage: boolean
    isFetchingNextPage: boolean
    fetchNextPage: () => void
}

function isRawSearchItem(item: unknown): item is RawSearchItem {
    return (
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'number'
    )
}

function normalizeRawSearchItem(item: unknown): RawSearchItem | null {
    if (!item || typeof item !== 'object') {
        return null
    }

    if ('entity' in item && item.entity && typeof item.entity === 'object') {
        const normalized = {
            ...(item.entity as Record<string, any>),
            highlights: (item as Record<string, any>).highlights,
        }

        return isRawSearchItem(normalized) ? normalized : null
    }

    return isRawSearchItem(item) ? item : null
}

function dedupeRowsById<RowType extends { id: number }>(rows: RowType[]) {
    const dedupedRows = new Map<number, RowType>()

    rows.forEach((row) => {
        if (!dedupedRows.has(row.id)) {
            dedupedRows.set(row.id, row)
        }
    })

    return Array.from(dedupedRows.values())
}

function mapRows<RowType extends { id: number }>(
    items: unknown[],
    mapper: (item: RawSearchItem) => RowType | null,
) {
    return dedupeRowsById(
        items
            .map(normalizeRawSearchItem)
            .filter((item): item is RawSearchItem => item !== null)
            .map(mapper)
            .filter((item): item is RowType => item !== null),
    )
}

export function useSearchSpotlightData({
    query,
    isOpen,
    showCalls,
}: UseSearchSpotlightDataOptions) {
    const debouncedQuery = useDebouncedValue(query.trim(), Duration.seconds(1))
    const isSearchMode = isOpen && debouncedQuery.length > 0
    const queryLimit = isSearchMode ? SEARCH_RESULT_LIMIT : 1

    const ticketsQuery = useSearchAllTickets(
        {
            search: debouncedQuery,
            filters: '',
        },
        {
            limit: queryLimit,
            with_highlights: true,
            track_total_hits: true,
        },
        {
            exhaustPages: false,
            query: {
                enabled: isSearchMode,
            },
        },
    )

    const customersQuery = useSearchAllCustomers(
        {
            search: debouncedQuery,
        },
        {
            limit: queryLimit,
            with_highlights: true,
        },
        {
            exhaustPages: false,
            query: {
                enabled: isSearchMode,
            },
        },
    )

    const callsQuery = useInfiniteVoiceCallSearch({
        query: debouncedQuery,
        enabled: isSearchMode && showCalls,
        limit: queryLimit,
    })

    const ticketResponse = extractResponseData(ticketsQuery.data?.pages?.[0])
    const customerResponse = extractResponseData(
        customersQuery.data?.pages?.[0],
    )
    const callResponse = extractResponseData(callsQuery.data?.pages?.[0])

    const tickets = useMemo(
        () => mapRows(ticketsQuery.items ?? [], toTicketRow),
        [ticketsQuery.items],
    )
    const customers = useMemo(
        () => mapRows(customersQuery.items ?? [], toCustomerRow),
        [customersQuery.items],
    )
    const calls = useMemo(
        () => mapRows(callsQuery.items ?? [], toCallRow),
        [callsQuery.items],
    )

    const pagination = useMemo<
        Record<'tickets' | 'customers' | 'calls', SpotlightPaginationState>
    >(
        () => ({
            tickets: {
                hasNextPage: Boolean(ticketsQuery.hasNextPage),
                isFetchingNextPage: ticketsQuery.isFetchingNextPage,
                fetchNextPage: () => {
                    if (
                        !ticketsQuery.hasNextPage ||
                        ticketsQuery.isFetchingNextPage
                    ) {
                        return
                    }

                    void ticketsQuery.fetchNextPage()
                },
            },
            customers: {
                hasNextPage: Boolean(customersQuery.hasNextPage),
                isFetchingNextPage: customersQuery.isFetchingNextPage,
                fetchNextPage: () => {
                    if (
                        !customersQuery.hasNextPage ||
                        customersQuery.isFetchingNextPage
                    ) {
                        return
                    }

                    void customersQuery.fetchNextPage()
                },
            },
            calls: {
                hasNextPage: Boolean(callsQuery.hasNextPage),
                isFetchingNextPage: callsQuery.isFetchingNextPage,
                fetchNextPage: () => {
                    if (
                        !callsQuery.hasNextPage ||
                        callsQuery.isFetchingNextPage
                    ) {
                        return
                    }

                    void callsQuery.fetchNextPage()
                },
            },
        }),
        [
            callsQuery.fetchNextPage,
            callsQuery.hasNextPage,
            callsQuery.isFetchingNextPage,
            customersQuery.fetchNextPage,
            customersQuery.hasNextPage,
            customersQuery.isFetchingNextPage,
            ticketsQuery.fetchNextPage,
            ticketsQuery.hasNextPage,
            ticketsQuery.isFetchingNextPage,
        ],
    )

    return {
        isSearchMode,
        isLoading:
            isSearchMode &&
            (ticketsQuery.isLoading ||
                customersQuery.isLoading ||
                (showCalls && callsQuery.isLoading)),
        tickets,
        customers,
        calls,
        totals: {
            tickets: toTotalCount(ticketResponse, tickets.length),
            customers: toTotalCount(customerResponse, customers.length),
            calls: toTotalCount(callResponse, calls.length),
        },
        pagination,
    }
}

import { useMemo } from 'react'

import { useSearchTickets } from '@gorgias/helpdesk-queries'
import type {
    TicketHighlight,
    TicketHighlightDataItem,
} from '@gorgias/helpdesk-types'

import type { SearchTicket, UseTicketSearchOptions } from '../types/search'

type SearchMeta = {
    nextCursor?: string
    prevCursor?: string
}

type SearchResponseCandidate = {
    data?: unknown[]
    meta?: {
        next_cursor?: string | null
        prev_cursor?: string | null
    }
}

function getSearchResponse(
    candidate: unknown,
): TicketHighlight | SearchResponseCandidate | undefined {
    if (!candidate || typeof candidate !== 'object') {
        return undefined
    }

    if ('meta' in candidate && 'data' in candidate) {
        return candidate as TicketHighlight | SearchResponseCandidate
    }

    if (
        'data' in candidate &&
        candidate.data &&
        typeof candidate.data === 'object' &&
        'meta' in candidate.data &&
        'data' in candidate.data
    ) {
        return candidate.data as TicketHighlight | SearchResponseCandidate
    }

    return undefined
}

export function useTicketSearch({
    query,
    filters,
    cursor,
    limit,
    orderBy,
    enabled = true,
}: UseTicketSearchOptions) {
    const shouldSearch = enabled

    const result = useSearchTickets(
        {
            search: query,
            filters,
        },
        {
            cursor,
            limit,
            order_by: orderBy,
            with_highlights: true,
            track_total_hits: true,
        },
        {
            query: {
                enabled: shouldSearch,
                refetchOnWindowFocus: true,
            },
        },
    )

    const response = getSearchResponse(result.data)
    const searchItems = useMemo(
        () => (Array.isArray(response?.data) ? response.data : []),
        [response],
    )

    const tickets = useMemo(
        (): SearchTicket[] =>
            searchItems.flatMap((item) => {
                const ticketItem = item as TicketHighlightDataItem &
                    Partial<SearchTicket>

                if (ticketItem.entity) {
                    return [
                        {
                            ...(ticketItem.entity as SearchTicket),
                            highlights: ticketItem.highlights,
                        } as SearchTicket,
                    ]
                }

                if (!('id' in ticketItem)) {
                    return []
                }

                return [
                    {
                        ...ticketItem,
                    } as SearchTicket,
                ]
            }),
        [searchItems],
    )

    const meta = useMemo<SearchMeta>(
        () => ({
            nextCursor: response?.meta?.next_cursor ?? undefined,
            prevCursor: response?.meta?.prev_cursor ?? undefined,
        }),
        [response],
    )

    return {
        tickets,
        meta,
        isLoading: shouldSearch ? result.isLoading : false,
        isFetching: shouldSearch ? result.isFetching : false,
        error: result.error,
        refetch: result.refetch,
        shouldSearch,
    }
}

import { useMemo } from 'react'

import type { InfiniteData } from '@tanstack/react-query'

import type { HttpResponse, ListTickets200 } from '@gorgias/helpdesk-client'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../constants'
import { useInfiniteListTickets } from './useInfiniteListTickets'

type TransformedTicketData = InfiniteData<HttpResponse<ListTickets200>> & {
    tickets: ListTickets200['data']
}

export function useTicketList(shopperId?: number) {
    const isEnabled = Number.isInteger(shopperId)

    const result = useInfiniteListTickets(
        {
            trashed: false,
            limit: TICKET_FETCHED_LIMIT,
            customer_id: shopperId,
        },
        {
            enabled: isEnabled,
            staleTime: TICKET_FETCH_STALE_TIME,
            select: (
                data,
            ): InfiniteData<HttpResponse<ListTickets200>> & {
                tickets: ListTickets200['data']
            } => ({
                ...data,
                tickets: data.pages.flatMap((page) => page.data.data),
            }),
        },
    )

    return useMemo(() => {
        const data = result.data as TransformedTicketData | undefined
        const tickets = data?.tickets ?? []
        const totalTickets = data?.pages[0]?.data.meta.total_resources ?? 0

        return {
            isLoading: result.isLoading,
            isError: result.isError,
            tickets: isEnabled ? tickets : [],
            totalTickets: isEnabled ? totalTickets : 0,
            hasNextPage: result.hasNextPage,
            fetchNextPage: result.fetchNextPage,
            isFetchingNextPage: result.isFetchingNextPage,
        }
    }, [
        isEnabled,
        result.isLoading,
        result.isError,
        result.data,
        result.hasNextPage,
        result.fetchNextPage,
        result.isFetchingNextPage,
    ])
}

import { useMemo } from 'react'

import { useListTickets } from '@gorgias/helpdesk-queries'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../constants'

export function useTicketList(shopperId?: number) {
    const isEnabled = Number.isInteger(shopperId)

    const result = useListTickets(
        {
            trashed: false,
            limit: TICKET_FETCHED_LIMIT,
            customer_id: shopperId,
        },
        {
            query: {
                enabled: isEnabled,
                staleTime: TICKET_FETCH_STALE_TIME,
            },
        },
    )

    return useMemo(() => {
        const tickets = result?.data?.data?.data ?? []
        return {
            isLoading: result.isLoading,
            isError: result.isError,
            tickets: isEnabled ? tickets : [],
        }
    }, [isEnabled, result.isLoading, result.isError, result.data?.data?.data])
}

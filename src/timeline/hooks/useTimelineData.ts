import { useMemo } from 'react'

import { useListTickets } from '@gorgias/api-queries'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../constants'

export function useTimelineData(shopperId?: number) {
    const isEnabled = Number.isInteger(shopperId)

    const { data, isLoading } = useListTickets(
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

    const tickets = data?.data.data

    return useMemo(
        () => ({
            isLoading,
            tickets: isEnabled ? tickets || [] : [],
        }),
        [isEnabled, isLoading, tickets],
    )
}

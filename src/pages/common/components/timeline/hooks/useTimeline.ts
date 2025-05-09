import { useMemo } from 'react'

import { isNumber } from 'lodash'

import { useListTickets } from '@gorgias/api-queries'

import { useSearchParam } from 'hooks/useSearchParam'

import {
    TICKET_FETCH_STALE_TIME,
    TICKET_FETCHED_LIMIT,
    TIMELINE_SEARCH_PARAM,
} from '../constants'

export function useTimeline(customerId?: number) {
    const [timelineShopperId, setTimelineShopperId] = useSearchParam(
        TIMELINE_SEARCH_PARAM,
    )

    // If this hook is being called with a customerId which is different
    // from the timelineShopperId, then it means we are currently looking at
    // a different customer, so we need to clear the timeline. We don’t want
    // to update the timeline because it might not contain any relevant data
    if (
        customerId &&
        timelineShopperId &&
        timelineShopperId !== customerId.toString()
    ) {
        setTimelineShopperId(null)
    }

    const shopperId = timelineShopperId ? Number(timelineShopperId) : customerId

    const { data, isLoading } = useListTickets(
        {
            trashed: false,
            limit: TICKET_FETCHED_LIMIT,
            customer_id: shopperId,
        },
        {
            query: {
                enabled: isNumber(shopperId),
                staleTime: TICKET_FETCH_STALE_TIME,
            },
        },
    )

    const tickets = data?.data.data

    return useMemo(
        () => ({
            isLoading,
            isOpen: Boolean(timelineShopperId),
            timelineShopperId,
            tickets: tickets || [],
            openTimeline: (shopperId: number) =>
                setTimelineShopperId(shopperId.toString()),
            closeTimeline: () => setTimelineShopperId(null),
        }),
        [isLoading, tickets, timelineShopperId, setTimelineShopperId],
    )
}

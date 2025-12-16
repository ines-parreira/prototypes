import { useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'

import type { Ticket } from '@gorgias/helpdesk-queries'
import { OrderDirection, useSearchTickets } from '@gorgias/helpdesk-queries'

import { TicketSearchSortableProperties } from '../../../../types/ticket'
import { getMergeTicketsSearchFilters } from './utils'

export function useMergeTicketSearch(ticket: Ticket) {
    const [searchQuery, setSearchQuery] = useState('')
    const search = useDebouncedValue(searchQuery, 300)

    const { data: tickets, isFetching } = useSearchTickets(
        {
            search,
            filters: getMergeTicketsSearchFilters({
                search,
                ticketId: ticket.id,
                customerId: ticket.customer?.id,
            }),
        },
        {
            limit: 8,
            order_by: `${TicketSearchSortableProperties.LastMessageDatetime}:${OrderDirection.Desc}`,
        },
        {
            query: {
                refetchOnWindowFocus: false,
            },
        },
    )

    return {
        tickets,
        isFetching,
        searchQuery,
        setSearchQuery,
    }
}

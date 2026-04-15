import { useCallback, useEffect } from 'react'

import type { TicketCompact } from '@gorgias/helpdesk-types'

import { useViewedTickets } from '../providers/ViewedTicketsProvider'

export function useViewVisibleTickets() {
    const { viewTickets } = useViewedTickets()

    const viewVisibleTickets = useCallback(
        (visibleTickets: TicketCompact[]) => {
            const ticketIds = visibleTickets.map((t) => t.id)
            if (ticketIds.length > 0) {
                viewTickets(ticketIds)
            }
        },
        [viewTickets],
    )

    useEffect(() => {
        return () => {
            viewTickets([])
        }
    }, [viewTickets])

    return { viewVisibleTickets }
}

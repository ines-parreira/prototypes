import { useEffect, useState } from 'react'

import { useDeepEffect } from '@repo/hooks'
import { useViewedTickets } from '@repo/tickets/ticket-list'

import type { TicketPartial } from 'ticket-list-view/types'

export default function useViewTickets(partials: TicketPartial[]) {
    const { viewTickets } = useViewedTickets()
    const [ticketIds, setTicketIds] = useState<number[]>([])

    useEffect(() => {
        setTicketIds(partials.map((partial) => partial.id))
    }, [partials])

    useDeepEffect(() => {
        viewTickets(ticketIds)
    }, [ticketIds, viewTickets])

    useEffect(() => {
        return () => {
            viewTickets([])
        }
    }, [viewTickets])
}

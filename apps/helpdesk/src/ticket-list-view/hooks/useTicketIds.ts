import { useEffect, useRef } from 'react'

import { TicketCompact } from '../types'

export default function useTicketIds(tickets: TicketCompact[]) {
    const ticketIds = useRef<number[]>([])

    useEffect(() => {
        ticketIds.current = tickets.map((ticket) => ticket.id)
    }, [tickets])

    return ticketIds
}

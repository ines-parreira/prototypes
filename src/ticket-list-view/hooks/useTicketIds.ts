import {useEffect, useRef} from 'react'

import {TicketSummary} from '../types'

export default function useTicketIds(tickets: TicketSummary[]) {
    const ticketIds = useRef<number[]>([])

    useEffect(() => {
        ticketIds.current = tickets.map((ticket) => ticket.id)
    }, [tickets])

    return ticketIds
}

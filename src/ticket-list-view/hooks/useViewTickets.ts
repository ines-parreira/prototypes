import {useAgentActivity} from '@gorgias/realtime'
import {useEffect, useState} from 'react'

import useDeepEffect from 'hooks/useDeepEffect'
import {TicketPartial} from 'ticket-list-view/types'

export default function useViewTickets(partials: TicketPartial[]) {
    const {viewTickets} = useAgentActivity()
    const [ticketIds, setTicketIds] = useState<number[]>([])

    useEffect(() => {
        setTicketIds(partials.map((partial) => partial.id))
    }, [partials])

    useDeepEffect(() => {
        viewTickets(ticketIds)
    }, [ticketIds])
}

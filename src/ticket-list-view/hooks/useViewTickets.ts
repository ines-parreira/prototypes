import {useAgentActivity} from '@gorgias/realtime'
import _debounce from 'lodash/debounce'
import {useCallback, useEffect, useState} from 'react'

import useDeepEffect from 'hooks/useDeepEffect'
import {TicketPartial} from 'ticket-list-view/types'

export const DEBOUNCED_VIEW_TICKETS_DELAY = 1000

export default function useViewTickets(
    partials: TicketPartial[],
    shouldDebounce = false
) {
    const {viewTickets} = useAgentActivity()
    const [ticketIds, setTicketIds] = useState<number[]>([])

    useEffect(() => {
        setTicketIds(partials.map((partial) => partial.id))
    }, [partials])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedViewTickets = useCallback(
        _debounce(
            viewTickets,
            shouldDebounce ? DEBOUNCED_VIEW_TICKETS_DELAY : 0
        ),
        [viewTickets]
    )

    useDeepEffect(() => {
        debouncedViewTickets(ticketIds)
    }, [ticketIds])
}

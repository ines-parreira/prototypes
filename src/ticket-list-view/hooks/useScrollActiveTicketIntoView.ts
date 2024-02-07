import {MutableRefObject, useCallback, useEffect, useMemo} from 'react'
import {VirtuosoHandle} from 'react-virtuoso'

import usePrevious from 'hooks/usePrevious'
import useUpdateEffect from 'hooks/useUpdateEffect'

import {TicketSummary} from '../types'

export default function useScrollActiveTicketIntoView(
    activeTicketId: number | undefined,
    tickets: TicketSummary[],
    ticketIds: MutableRefObject<number[]>,
    virtuosoRef: MutableRefObject<VirtuosoHandle | null>
) {
    const previousTickets = usePrevious(tickets)

    const isFirstSetOfTickets = useMemo(() => {
        return previousTickets?.length === 0 && tickets.length > 0
    }, [tickets, previousTickets])

    const scrollActiveTicketIntoView = useCallback(
        (ticketId: number | undefined, initialLoad = false) => {
            const ticketIndex = ticketId && ticketIds.current.indexOf(ticketId)

            if (virtuosoRef.current && typeof ticketIndex === 'number') {
                virtuosoRef.current.scrollIntoView({
                    index: ticketIndex,
                    behavior: initialLoad ? undefined : 'smooth',
                    align: 'center',
                })
            }
        },
        [virtuosoRef, ticketIds]
    )

    useUpdateEffect(() => {
        activeTicketId && scrollActiveTicketIntoView(activeTicketId)
    }, [activeTicketId, scrollActiveTicketIntoView])

    // Scroll the active ticket into view after the first ticket set is present
    // Animation is disabled to simulate pre-scroll
    useEffect(() => {
        setTimeout(() => {
            isFirstSetOfTickets &&
                scrollActiveTicketIntoView(activeTicketId, true)
        })
    }, [isFirstSetOfTickets, activeTicketId, scrollActiveTicketIntoView])
}

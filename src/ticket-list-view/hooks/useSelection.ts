import {useCallback, useMemo, useRef, useState} from 'react'

import {TicketSummary} from '../types'

export default function useSelection(tickets: TicketSummary[]) {
    const [selectedTickets, setSelectedTickets] = useState<
        Record<number, boolean>
    >({})
    const previousId = useRef<number | null>(null)

    const handleSelect = useCallback(
        (id: number, selected: boolean, selectRange?: boolean) => {
            setSelectedTickets((s) => {
                if (!selectRange || !previousId.current) {
                    previousId.current = id
                    if (selected) {
                        return {...s, [id]: true}
                    }

                    const newState = {...s}
                    delete newState[id]
                    return newState
                }

                const ticketIndices = [
                    tickets.findIndex(
                        (ticket) => ticket.id === previousId.current
                    ),
                    tickets.findIndex((ticket) => ticket.id === id),
                ].sort()

                previousId.current = id

                if (ticketIndices.some((index) => index < 0)) {
                    return s
                }

                const ticketIds = tickets
                    .slice(ticketIndices[0], ticketIndices[1] + 1)
                    .map((ticket) => ticket.id)

                if (selected) {
                    return ticketIds.reduce(
                        (acc, ticketId) => ({
                            ...acc,
                            [ticketId]: true,
                        }),
                        s
                    )
                }

                const newState = {...s}
                ticketIds.forEach((ticketId) => {
                    delete newState[ticketId]
                })
                return newState
            })
        },
        [tickets]
    )

    const clear = useCallback(() => setSelectedTickets({}), [])

    return useMemo(
        () => ({
            selectedTickets,
            onSelect: handleSelect,
            clear,
        }),
        [handleSelect, selectedTickets, clear]
    )
}

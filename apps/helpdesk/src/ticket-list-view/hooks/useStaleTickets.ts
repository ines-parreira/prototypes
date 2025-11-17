import { useCallback, useEffect, useMemo, useState } from 'react'

import type { TicketPartial } from '../types'

type TicketTimestamps = Record<number, number>

export default function useStaleTickets(partials: TicketPartial[]) {
    const [state, setState] = useState<{
        pending: TicketTimestamps
        updated: TicketTimestamps
    }>({
        pending: {},
        updated: {},
    })

    useEffect(() => {
        setState((s) => {
            const { pending, updated } = s

            // determine if a ticket has been updated based on these rules:
            // - if the ticket has not been marked as `updated`
            // - if the new updated time is:
            //   - later than current update time
            //   - it is not already pending an update
            const updates = partials.filter(
                (p) =>
                    !updated[p.id] ||
                    (p.updated_datetime > updated[p.id] &&
                        p.updated_datetime > (pending[p.id] || 0)),
            )

            if (!updates.length) return s

            return {
                ...s,
                pending: updates.reduce(
                    (acc, p) => ({ ...acc, [p.id]: p.updated_datetime }),
                    pending,
                ),
            }
        })
    }, [partials])

    const markUpdated = useCallback((ticketIds: number[]) => {
        setState((s) => {
            if (!ticketIds.length) return s

            const newPending = { ...s.pending }
            const newUpdated = { ...s.updated }

            ticketIds.forEach((ticketId) => {
                newUpdated[ticketId] = newPending[ticketId]
                delete newPending[ticketId]
            })

            return { ...s, pending: newPending, updated: newUpdated }
        })
    }, [])

    const staleTickets = useMemo(
        () =>
            Object.keys(state.pending).reduce(
                (acc, ticketId) => ({ ...acc, [ticketId]: true }),
                {} as Record<number, boolean>,
            ),
        [state],
    )

    return { markUpdated, staleTickets }
}

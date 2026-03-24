import { useMemo } from 'react'

import { useSortOrder } from '../ticket-list/hooks/useSortOrder'
import { useTicketsList } from '../ticket-list/hooks/useTicketsList'
import type { useTicketsLegacyBridge } from '../utils/LegacyBridge'

type TicketViewNavigation = ReturnType<
    typeof useTicketsLegacyBridge
>['ticketViewNavigation']

function getTicketViewNavigationFromTickets({
    tickets,
    ticketId,
}: {
    tickets?: Array<{ id?: number }>
    ticketId?: number
}): TicketViewNavigation | undefined {
    if (!tickets || !ticketId) {
        return undefined
    }

    const navigableTickets = tickets.filter(
        (ticket): ticket is { id: number } => typeof ticket.id === 'number',
    )
    const ticketIndex = navigableTickets.findIndex(
        (ticket) => ticket.id === ticketId,
    )

    if (ticketIndex === -1) {
        return undefined
    }

    const previousTicketId = navigableTickets[ticketIndex - 1]?.id
    const nextTicketId = navigableTickets[ticketIndex + 1]?.id
    const isPreviousEnabled = previousTicketId !== undefined
    const isNextEnabled = nextTicketId !== undefined

    return {
        shouldDisplay: isPreviousEnabled || isNextEnabled,
        shouldUseLegacyFunctions: false,
        previousTicketId,
        nextTicketId,
        legacyGoToPrevTicket: async () => undefined,
        isPreviousEnabled,
        legacyGoToNextTicket: async () => undefined,
        isNextEnabled,
    }
}

export function useCachedTicketViewNavigation({
    viewId,
    ticketId,
}: {
    viewId?: number
    ticketId?: number
}) {
    const [sortOrder] = useSortOrder(viewId ?? 0)
    const { tickets } = useTicketsList(viewId ?? 0, {
        params: viewId ? { order_by: sortOrder } : undefined,
        enabled: Boolean(viewId),
    })

    return useMemo(
        () =>
            getTicketViewNavigationFromTickets({
                tickets,
                ticketId,
            }),
        [tickets, ticketId],
    )
}

import { useShortcuts } from '@repo/utils'

import type { Ticket } from '@gorgias/helpdesk-types'

import { useCloseTicket } from './useCloseTicket'
import { useOpenTicket } from './useOpenTicket'
import { getTicketStatus, TicketStatus } from './utils'

type Props = {
    ticket: Ticket
    onOpenSnooze: () => void
}

export function useTicketStatusShortcuts({ ticket, onOpenSnooze }: Props) {
    const { openTicket } = useOpenTicket(ticket.id)
    const { closeTicket } = useCloseTicket(ticket.id)
    const status = getTicketStatus(ticket)

    const actions = {
        OPEN_TICKET: {
            action: async () =>
                status !== TicketStatus.Open && (await openTicket()),
        },
        CLOSE_TICKET: {
            action: async () => await closeTicket(),
        },
        OPEN_SNOOZE_TICKET: {
            action: onOpenSnooze,
        },
    }

    useShortcuts('TicketStatusActions', actions)
}

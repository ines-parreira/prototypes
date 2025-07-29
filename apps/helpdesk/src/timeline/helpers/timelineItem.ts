import { TicketCompact } from '@gorgias/helpdesk-types'

import { TimelineItem, TimelineItemKind, TimelineTicket } from '../types'

export function getItemId(item: TimelineItem): number {
    switch (item.kind) {
        case TimelineItemKind.Ticket:
            return item.ticket.id
        case TimelineItemKind.Order:
            return item.order.id
    }
}

export function fromTicket(ticket: TicketCompact): TimelineItem {
    return {
        kind: TimelineItemKind.Ticket,
        ticket,
    }
}

export function isTicket(item: TimelineItem): item is TimelineTicket {
    return item.kind === TimelineItemKind.Ticket
}

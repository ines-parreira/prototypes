import { TicketCompact } from '@gorgias/helpdesk-types'

import { Order } from 'constants/integrations/types/shopify'
import { CustomerIntegration } from 'models/customer/types'
import { SORTABLE_KEY_TO_ORDER_KEY } from 'timeline/constants'

import {
    SortableKey,
    SupportedOrderIntegration,
    TimelineItem,
    TimelineItemKind,
    TimelineOrder,
    TimelineTicket,
} from '../types'

export function getItemId(item: TimelineItem): number {
    if (item.kind === TimelineItemKind.Ticket) {
        return item.ticket.id
    }
    return item.order.id
}

export function getCreatedDate(item: TimelineItem): Date {
    if (item.kind === TimelineItemKind.Order) {
        return new Date(item.order.created_at)
    }
    return new Date(item.ticket.created_datetime)
}

export function fromTicket(ticket: TicketCompact): TimelineItem {
    return {
        kind: TimelineItemKind.Ticket,
        ticket,
    }
}

export function toTicket(item: TimelineItem): TicketCompact | null {
    if (item.kind === TimelineItemKind.Ticket) {
        return item.ticket
    }

    return null
}

export function toOrder(item: TimelineItem): Order {
    if (item.kind === TimelineItemKind.Order) {
        return item.order
    }
    throw new Error('Item is not an order')
}

export function fromOrder(order: Order): TimelineItem {
    return {
        kind: TimelineItemKind.Order,
        order,
    }
}

export function isTicket(item: TimelineItem): item is TimelineTicket {
    return item.kind === TimelineItemKind.Ticket
}

export function isOrder(item: TimelineItem): item is TimelineOrder {
    return item.kind === TimelineItemKind.Order
}

export function isSupportedOrderIntegration(
    item: CustomerIntegration,
): boolean {
    return SupportedOrderIntegration.includes(item.__integration_type__)
}

// A bit hacky solution, yet it's straightforward and overall safe
// since all the shady stuff is done within the function, but outside of it
// the contract (signature) is typed properly.
export function getDateTimeField(
    item: TimelineItem,
    key: SortableKey,
): string | null {
    let result: string | undefined
    if (item.kind === TimelineItemKind.Ticket) {
        result = item.ticket[key as keyof TicketCompact] as string | undefined
    } else {
        const orderKey = SORTABLE_KEY_TO_ORDER_KEY[key]
        result = item.order[orderKey as keyof Order] as string | undefined
    }
    return result ?? null
}

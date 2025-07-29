import { TicketCompact, TicketStatus } from '@gorgias/helpdesk-queries'

import { Order } from 'constants/integrations/types/shopify'

import { SORTABLE_KEY_TO_LABEL, SORTABLE_KEYS } from './constants'

export type Range = {
    start: number | null
    end: number | null
}

export type FilterKey = TicketStatus | 'snooze'

export type SortType = 'asc' | 'desc'
export type SortableKey = (typeof SORTABLE_KEYS)[number]

export type SortOption = {
    order: SortType
    key: SortableKey
    label: (typeof SORTABLE_KEY_TO_LABEL)[SortableKey]
}

export enum TimelineItemKind {
    Ticket = 'ticket',
    Order = 'order',
}

interface TimelineItemBase {
    kind: TimelineItemKind
}

export interface TimelineTicket extends TimelineItemBase {
    kind: TimelineItemKind.Ticket
    ticket: TicketCompact
}

export interface TimelineOrder extends TimelineItemBase {
    kind: TimelineItemKind.Order
    order: Order
}

export type TimelineItem = TimelineTicket | TimelineOrder

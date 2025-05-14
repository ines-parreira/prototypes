import type { Ticket } from 'models/ticket/types'

export type SortField =
    | 'created_datetime'
    | 'last_message_datetime'
    | 'last_received_message_datetime'

export type TicketPartial = {
    id: number
    updated_datetime: number
}

export type TicketCompact = Pick<
    Ticket,
    | 'id'
    | 'channel'
    | 'created_datetime'
    | 'customer'
    | 'excerpt'
    | 'is_unread'
    | 'last_message_datetime'
    | 'last_received_message_datetime'
    | 'status'
    | 'subject'
    | 'updated_datetime'
>

import type {Ticket} from 'models/ticket/types'

export type ApiTicketPartial = Pick<Ticket, 'id' | 'updated_datetime'>

export type TicketPartial = {
    id: number
    updated_datetime: number
}

export type TicketSummary = Pick<
    Ticket,
    'id' | 'channel' | 'excerpt' | 'subject' | 'updated_datetime'
>

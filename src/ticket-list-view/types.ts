import type {Ticket} from 'models/ticket/types'

export type ApiTicketPartial = Pick<Ticket, 'id' | 'updated_datetime'>

export type TicketPartial = {
    id: number
    updated_datetime: number
}

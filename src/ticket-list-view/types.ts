import type {Ticket} from 'models/ticket/types'

export type TicketPartial = Pick<Ticket, 'id' | 'updated_datetime'>

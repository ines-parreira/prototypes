//@flow
import {
    TicketChannels,
    TicketStatuses,
    TicketMessageSourceTypes,
} from '../ticket.ts'

export type TicketChannel = $Values<typeof TicketChannels>

export type TicketStatus = $Values<typeof TicketStatuses>

export type TicketMessageSourceType = $Values<typeof TicketMessageSourceTypes>

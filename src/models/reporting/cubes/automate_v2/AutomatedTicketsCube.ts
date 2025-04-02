import { Cube } from 'models/reporting/types'

export enum AutomatedTicketsMeasure {
    NumAutomatedTickets = 'AutomatedTickets.count',
}

export enum AutomatedTicketsDimension {
    TicketId = 'AutomatedTickets.ticketId',
}

export enum AutomatedTicketsFilterMember {
    TicketId = 'AutomatedTickets.ticketId',
}
export enum AutomatedTicketsSegment {}

export type AutomatedTicketsCube = Cube<
    AutomatedTicketsMeasure,
    AutomatedTicketsDimension,
    AutomatedTicketsSegment,
    AutomatedTicketsFilterMember
>

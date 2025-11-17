import type { Cube } from 'domains/reporting/models/types'

export enum AutomatedTicketsMeasure {
    NumAutomatedTickets = 'AutomatedTickets.count',
}

export enum AutomatedTicketsDimension {
    TicketId = 'AutomatedTickets.ticketId',
}

export enum AutomatedTicketsFilterMember {
    PeriodStart = 'AutomatedTickets.periodStart',
    PeriodEnd = 'AutomatedTickets.periodEnd',
    TicketId = 'AutomatedTickets.ticketId',
}
export enum AutomatedTicketsSegment {}

export type AutomatedTicketsCube = Cube<
    AutomatedTicketsMeasure,
    AutomatedTicketsDimension,
    AutomatedTicketsSegment,
    AutomatedTicketsFilterMember
>

import type { Cube } from 'domains/reporting/models/types'

export enum BillableTicketDimension {
    AccountId = 'accountId',
    TicketCreatedDate = 'ticketCreatedDate',
    TotalTicketsPerDay = 'totalTicketsPerDay',
    TotalResolutionTimePerDay = 'totalResolutionTimePerDay',
    TotalFirstResponseTimePerDay = 'totalFirstResponseTimePerDay',
    TotalBillableTicketPerDay = 'totalBillableTicketPerDay',
}

export type BillableTicketCube = Cube<BillableTicketDimension, never>

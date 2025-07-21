import { Cube } from 'domains/reporting/models/types'

export enum TicketProductsEnrichedMeasure {
    TicketCount = 'TicketProductsEnriched.ticketCount',
}

export enum TicketProductsEnrichedDimension {
    TicketId = 'TicketProductsEnriched.ticketId',
    AccountId = 'TicketProductsEnriched.accountId',
    ProductId = 'TicketProductsEnriched.productId',
    StoreId = 'TicketProductsEnriched.storeId',
    PeriodStart = 'TicketProductsEnriched.periodStart',
    DeletedDatetime = 'TicketProductsEnriched.deleted_datetime',
}

export enum TicketProductsEnrichedMember {
    TicketId = 'TicketProductsEnriched.ticketId',
    AccountId = 'TicketProductsEnriched.accountId',
    ProductId = 'TicketProductsEnriched.productId',
    PeriodStart = 'TicketProductsEnriched.periodStart',
    DeletedDatetime = 'TicketProductsEnriched.deleted_datetime',
}

export type TicketProductsEnrichedCube = Cube<
    TicketProductsEnrichedMeasure,
    TicketProductsEnrichedDimension,
    never,
    TicketProductsEnrichedMember,
    never
>

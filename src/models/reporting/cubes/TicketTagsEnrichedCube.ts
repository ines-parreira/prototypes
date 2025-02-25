import { Cube } from 'models/reporting/types'

export enum TicketTagsEnrichedMeasure {
    TicketCount = 'TicketTagsEnriched.ticketCount',
}

export enum TicketTagsEnrichedDimension {
    AccountId = 'TicketTagsEnriched.accountId',
    TicketId = 'TicketTagsEnriched.ticketId',
    TagId = 'TicketTagsEnriched.tagId',
    Timestamp = 'TicketTagsEnriched.timestamp',
}

export enum TicketTagsEnrichedMember {
    AccountId = 'TicketTagsEnriched.accountId',
    TicketId = 'TicketTagsEnriched.ticketId',
    TagId = 'TicketTagsEnriched.tagId',
    Timestamp = 'TicketTagsEnriched.timestamp',
}

export type TicketTagsEnrichedTimeDimension =
    ValueOf<TicketTagsEnrichedDimension.Timestamp>

export type TicketTagsEnrichedCube = Cube<
    TicketTagsEnrichedMeasure,
    TicketTagsEnrichedDimension,
    never,
    TicketTagsEnrichedMember,
    TicketTagsEnrichedTimeDimension
>

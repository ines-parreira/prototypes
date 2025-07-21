import { Cube } from 'domains/reporting/models/types'

export enum TicketTagsDimensions {
    TicketId = 'TicketTags.ticketId',
    AccountId = 'TicketTags.accountId',
    Tags = 'TicketTags.tags',
}

export type TicketTagsCube = Cube<
    never,
    TicketTagsDimensions,
    never,
    TicketTagsDimensions,
    never
>

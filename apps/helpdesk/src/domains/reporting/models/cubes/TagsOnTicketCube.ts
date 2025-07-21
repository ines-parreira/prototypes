import { Cube } from 'domains/reporting/models/types'

enum Dimensions {
    TicketId = 'TagsOnTicketEnriched.ticketId',
    AccountId = 'TagsOnTicketEnriched.accountId',
    TagId = 'TagsOnTicketEnriched.tagId',
}

export type TagsOnTicketCube = Cube<never, Dimensions>

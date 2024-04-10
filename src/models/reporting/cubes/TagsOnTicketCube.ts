import {Cube} from 'models/reporting/types'

enum Dimensions {
    TicketId = 'TagsOnTicketEnriched.ticketId',
    AccountId = 'TagsOnTicketEnriched.accountId',
    TagId = 'TagsOnTicketEnriched.tagId',
}

export type TagsOnTicketCube = Cube<never, Dimensions>

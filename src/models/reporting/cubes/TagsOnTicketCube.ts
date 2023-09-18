import {Cube} from 'models/reporting/types'

enum Dimensions {
    TicketId = 'TagsOnTicket.ticketId',
    AccountId = 'TagsOnTicket.accountId',
    TagId = 'TagsOnTicket.tagId',
}

export type TagsOnTicketCube = Cube<never, Dimensions>

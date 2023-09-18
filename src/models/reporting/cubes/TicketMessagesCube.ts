import {TicketTimeDimensions} from 'models/reporting/cubes/TicketCube'
import {Cube} from 'models/reporting/types'

export enum TicketMessagesMeasure {
    FirstResponseTime = 'TicketMessages.firstResponseTime',
    ResolutionTime = 'TicketMessages.resolutionTime',
    MessagesAverage = 'TicketMessages.messagesAverage',
}

export enum TicketMessagesDimension {
    FirstMessageChannel = 'TicketMessages.firstMessageChannel',
    Integration = 'TicketMessages.integration',
    FirstHelpdeskMessageUserId = 'TicketMessages.firstHelpdeskMessageUserId',
}

export enum TicketMessagesSegment {
    ConversationStarted = 'TicketMessages.conversationStarted',
    TicketCreatedByAgent = 'TicketMessages.ticketCreatedByAgent',
}

export enum TicketMessagesMember {
    FirstMessageChannel = 'TicketMessages.firstMessageChannel',
    Integration = 'TicketMessages.integration',
    FirstHelpdeskMessageDatetime = 'TicketMessages.firstHelpdeskMessageDatetime',
    FirstHelpdeskMessageUserId = 'TicketMessages.firstHelpdeskMessageUserId',
}

export type TicketMessagesCube = Cube<
    TicketMessagesMeasure,
    TicketMessagesDimension,
    TicketMessagesSegment,
    TicketMessagesMember,
    TicketTimeDimensions
>

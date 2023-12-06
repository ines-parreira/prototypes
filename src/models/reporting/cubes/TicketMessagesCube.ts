import {TicketTimeDimensions} from 'models/reporting/cubes/TicketCube'
import {Cube} from 'models/reporting/types'

export enum TicketMessagesMeasure {
    MedianFirstResponseTime = 'TicketMessages.medianFirstResponseTime',
    MedianResolutionTime = 'TicketMessages.medianResolutionTime',
    MessagesAverage = 'TicketMessages.messagesAverage',
}

export enum TicketMessagesDimension {
    FirstMessageChannel = 'TicketMessages.firstMessageChannel',
    Integration = 'TicketMessages.integration',
    FirstHelpdeskMessageUserId = 'TicketMessages.firstHelpdeskMessageUserId',
    OneTouchTickets = 'TicketMessages.oneTouchTickets',
    MessagesCount = 'TicketMessages.messagesCount',
    FirstResponseTime = 'TicketMessages.firstResponseTime',
    ResolutionTime = 'TicketMessages.resolutionTime',
}

export enum TicketMessagesSegment {
    ConversationStarted = 'TicketMessages.conversationStarted',
    TicketCreatedByAgent = 'TicketMessages.ticketCreatedByAgent',
}

export enum TicketMessagesMember {
    PeriodStart = 'TicketMessages.periodStart',
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

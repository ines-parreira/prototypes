import { TicketTimeDimensions } from 'models/reporting/cubes/TicketCube'
import { Cube } from 'models/reporting/types'

export enum TicketMessagesMeasure {
    MedianFirstResponseTime = 'TicketMessagesEnriched.medianFirstResponseTime',
    MedianResolutionTime = 'TicketMessagesEnriched.medianResolutionTime',
    MessagesAverage = 'TicketMessagesEnriched.messagesAverage',
}

export enum TicketMessagesDimension {
    FirstMessageChannel = 'TicketMessagesEnriched.firstMessageChannel',
    Integration = 'TicketMessagesEnriched.integration',
    FirstHelpdeskMessageUserId = 'TicketMessagesEnriched.firstHelpdeskMessageUserId',
    OneTouchTickets = 'TicketMessagesEnriched.oneTouchTickets',
    ZeroTouchTickets = 'TicketMessagesEnriched.zeroTouchTickets',
    MessagesCount = 'TicketMessagesEnriched.messagesCount',
    FirstResponseTime = 'TicketMessagesEnriched.firstResponseTime',
    ResolutionTime = 'TicketMessagesEnriched.resolutionTime',
    IntegrationChannelPair = 'TicketMessagesEnriched.integrationChannelPair',
}

export enum TicketMessagesSegment {
    ConversationStarted = 'TicketMessagesEnriched.conversationStarted',
    TicketCreatedByAgent = 'TicketMessagesEnriched.ticketCreatedByAgent',
}

export enum TicketMessagesMember {
    PeriodStart = 'TicketMessagesEnriched.periodStart',
    FirstMessageChannel = 'TicketMessagesEnriched.firstMessageChannel',
    Integration = 'TicketMessagesEnriched.integration',
    FirstHelpdeskMessageDatetime = 'TicketMessagesEnriched.firstHelpdeskMessageDatetime',
    SentDatetime = 'TicketMessagesEnriched.sentDatetime',
    FirstHelpdeskMessageUserId = 'TicketMessagesEnriched.firstHelpdeskMessageUserId',
    SenderId = 'TicketMessagesEnriched.senderId',
    IntegrationChannelPair = 'TicketMessagesEnriched.integrationChannelPair',
}

export type TicketMessagesCube = Cube<
    TicketMessagesMeasure,
    TicketMessagesDimension,
    TicketMessagesSegment,
    TicketMessagesMember,
    TicketTimeDimensions
>

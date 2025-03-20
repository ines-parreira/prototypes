import { Cube } from 'models/reporting/types'

export enum TicketMessagesEnrichedResponseTimesMeasure {
    MedianResponseTime = 'TicketMessagesEnrichedResponseTimes.medianResponseTime',
}

export enum TicketMessagesEnrichedResponseTimesDimension {
    TicketId = 'TicketMessagesEnrichedResponseTimes.ticketId',
    PeriodStart = 'TicketMessagesEnrichedResponseTimes.periodStart',
    Integration = 'TicketMessagesEnrichedResponseTimes.integration',
    ResponseTime = 'TicketMessagesEnrichedResponseTimes.responseTime',
    FirstHelpdeskMessageDatetime = 'TicketMessagesEnrichedResponseTimes.firstHelpdeskMessageDatetime',
    TicketMessageUserId = 'TicketMessagesEnrichedResponseTimes.ticketMessageUserId',
    FirstMessageChannel = 'TicketMessagesEnrichedResponseTimes.firstMessageChannel',
}

export enum TicketMessagesEnrichedResponseTimesSegment {
    ConversationStarted = 'TicketMessagesEnrichedResponseTimes.conversationStarted',
}

export enum TicketMessagesEnrichedResponseTimesMember {
    TicketId = 'TicketMessagesEnrichedResponseTimes.ticketId',
    PeriodStart = 'TicketMessagesEnrichedResponseTimes.periodStart',
    Integration = 'TicketMessagesEnrichedResponseTimes.integration',
    ResponseTime = 'TicketMessagesEnrichedResponseTimes.responseTime',
    FirstHelpdeskMessageDatetime = 'TicketMessagesEnrichedResponseTimes.firstHelpdeskMessageDatetime',
    TicketMessageUserId = 'TicketMessagesEnrichedResponseTimes.ticketMessageUserId',
    FirstMessageChannel = 'TicketMessagesEnrichedResponseTimes.firstMessageChannel',
}

export type TicketMessagesEnrichedResponseTimesTimeDimensions =
    ValueOf<TicketMessagesEnrichedResponseTimesDimension.FirstHelpdeskMessageDatetime>

export type TicketMessagesEnrichedResponseTimes = Cube<
    TicketMessagesEnrichedResponseTimesMeasure,
    TicketMessagesEnrichedResponseTimesDimension,
    TicketMessagesEnrichedResponseTimesSegment,
    TicketMessagesEnrichedResponseTimesMember,
    TicketMessagesEnrichedResponseTimesTimeDimensions
>

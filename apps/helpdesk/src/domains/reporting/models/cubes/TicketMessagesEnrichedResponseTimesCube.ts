import type { Cube } from 'domains/reporting/models/types'

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
    Store = 'TicketMessagesEnrichedResponseTimes.store',
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

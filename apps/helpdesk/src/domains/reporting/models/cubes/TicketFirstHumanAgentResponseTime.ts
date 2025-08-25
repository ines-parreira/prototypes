import { Cube } from 'domains/reporting/models/types'

export enum TicketFirstHumanAgentResponseTimeMeasure {
    MedianFirstHumanAgentResponseTime = 'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTime',
    MedianFirstHumanAgentResponseTimeInSeconds = 'TicketFirstHumanAgentResponseTime.medianFirstHumanAgentResponseTimeInSeconds',
}

export enum TicketFirstHumanAgentResponseTimeDimension {
    AccountId = 'TicketFirstHumanAgentResponseTime.accountId',
    FirstHumanAgentMessageDatetime = 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
    FirstHumanAgentMessageUserId = 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageUserId',
    FirstHumanAgentResponseTime = 'TicketFirstHumanAgentResponseTime.firstHumanAgentResponseTime',
    FirstHumanAgentResponseTimeInSeconds = 'TicketFirstHumanAgentResponseTime.firstHumanAgentResponseTimeInSeconds',
    Integration = 'TicketFirstHumanAgentResponseTime.integration',
    TicketId = 'TicketFirstHumanAgentResponseTime.ticketId',
}

export enum TicketFirstHumanAgentResponseTimeTimeDimension {
    FirstHumanAgentMessageDatetime = 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
}

export enum TicketFirstHumanAgentResponseTimeMember {
    AccountId = 'TicketFirstHumanAgentResponseTime.accountId',
    FirstHumanAgentMessageDatetime = 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageDatetime',
    FirstHumanAgentMessageUserId = 'TicketFirstHumanAgentResponseTime.firstHumanAgentMessageUserId',
    FirstHumanAgentResponseTime = 'TicketFirstHumanAgentResponseTime.firstHumanAgentResponseTime',
    FirstHumanAgentResponseTimeInSeconds = 'TicketFirstHumanAgentResponseTime.firstHumanAgentResponseTimeInSeconds',
    Integration = 'TicketFirstHumanAgentResponseTime.integration',
    TicketId = 'TicketFirstHumanAgentResponseTime.ticketId',
}

export type TicketFirstHumanAgentResponseTimeCube = Cube<
    TicketFirstHumanAgentResponseTimeMeasure,
    TicketFirstHumanAgentResponseTimeDimension,
    never,
    TicketFirstHumanAgentResponseTimeMember,
    TicketFirstHumanAgentResponseTimeTimeDimension
>

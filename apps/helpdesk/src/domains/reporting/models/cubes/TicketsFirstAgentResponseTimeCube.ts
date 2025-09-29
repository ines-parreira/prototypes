import { Cube } from 'domains/reporting/models/types'

export enum TicketsFirstAgentResponseTimeMeasure {
    MedianFirstAgentResponseTime = 'TicketFirstAgentResponseTime.medianFirstAgentResponseTime',
    MedianFirstAgentResponseTimeInSeconds = 'TicketFirstAgentResponseTime.medianFirstAgentResponseTimeInSeconds',
}

export enum TicketsFirstAgentResponseTimeDimension {
    AccountId = 'TicketFirstAgentResponseTime.accountId',
    FirstAgentMessageDatetime = 'TicketFirstAgentResponseTime.firstAgentMessageDatetime',
    FirstAgentMessageUserId = 'TicketFirstAgentResponseTime.firstAgentMessageUserId',
    FirstAgentResponseTime = 'TicketFirstAgentResponseTime.firstAgentResponseTime',
    FirstAgentResponseTimeInSeconds = 'TicketFirstAgentResponseTime.firstAgentResponseTimeInSeconds',
    Integration = 'TicketFirstAgentResponseTime.integration',
    Store = 'TicketFirstAgentResponseTime.store',
    TicketId = 'TicketFirstAgentResponseTime.ticketId',
}

export type TicketsFirstAgentResponseTimeCube = Cube<
    TicketsFirstAgentResponseTimeMeasure,
    TicketsFirstAgentResponseTimeDimension,
    never,
    never
>

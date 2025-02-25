import { TicketCubeWithJoins } from 'models/reporting/cubes/TicketCube'
import { Cube, JoinedCubesWithMapping } from 'models/reporting/types'

export enum HelpdeskMessageMeasure {
    TicketCount = 'HelpdeskMessageEnriched.ticketCount',
    MessageCount = 'HelpdeskMessageEnriched.messageCount',
}

export enum HelpdeskMessageDimension {
    TicketId = 'HelpdeskMessageEnriched.ticketId',
    PeriodStart = 'HelpdeskMessageEnriched.periodStart',
    PeriodEnd = 'HelpdeskMessageEnriched.periodEnd',
    Channel = 'HelpdeskMessageEnriched.channel',
    SentDatetime = 'HelpdeskMessageEnriched.sentDatetime',
    AccountId = 'HelpdeskMessageEnriched.accountId',
    SenderId = 'HelpdeskMessageEnriched.senderId',
}

export enum HelpdeskMessageMember {
    SentDatetime = 'HelpdeskMessageEnriched.sentDatetime',
    AccountId = 'HelpdeskMessageEnriched.accountId',
    PeriodStart = 'HelpdeskMessageEnriched.periodStart',
    PeriodEnd = 'HelpdeskMessageEnriched.periodEnd',
    Channel = 'HelpdeskMessageEnriched.channel',
    SenderId = 'HelpdeskMessageEnriched.senderId',
    IsMessagePublic = 'HelpdeskMessageEnriched.isMessagePublic',
    MessageVia = 'HelpdeskMessageEnriched.messageVia',
}

type HelpdeskMessageTimeDimensions =
    | ValueOf<HelpdeskMessageDimension.PeriodStart>
    | ValueOf<HelpdeskMessageDimension.PeriodEnd>
    | ValueOf<HelpdeskMessageDimension.SentDatetime>

type HelpdeskMessageCube = Cube<
    HelpdeskMessageMeasure,
    HelpdeskMessageDimension,
    HelpdeskMessageMember,
    never,
    HelpdeskMessageTimeDimensions
>

export type HelpdeskMessageCubeWithJoins = JoinedCubesWithMapping<
    HelpdeskMessageCube,
    TicketCubeWithJoins
>

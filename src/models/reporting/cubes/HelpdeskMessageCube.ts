import {TicketCubeWithJoins} from 'models/reporting/cubes/TicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum HelpdeskMessageMeasure {
    TicketCount = 'HelpdeskMessage.ticketCount',
    MessageCount = 'HelpdeskMessage.messageCount',
}

export enum HelpdeskMessageDimension {
    TicketId = 'HelpdeskMessage.ticketId',
    PeriodStart = 'HelpdeskMessage.periodStart',
    PeriodEnd = 'HelpdeskMessage.periodEnd',
    Channel = 'HelpdeskMessage.channel',
    SentDatetime = 'HelpdeskMessage.sentDatetime',
    AccountId = 'HelpdeskMessage.accountId',
    SenderId = 'HelpdeskMessage.senderId',
}

export enum HelpdeskMessageMember {
    SentDatetime = 'HelpdeskMessage.sentDatetime',
    AccountId = 'HelpdeskMessage.accountId',
    PeriodStart = 'HelpdeskMessage.periodStart',
    PeriodEnd = 'HelpdeskMessage.periodEnd',
    Channel = 'HelpdeskMessage.channel',
    SenderId = 'HelpdeskMessage.senderId',
    IsMessagePublic = 'HelpdeskMessage.isMessagePublic',
    MessageVia = 'HelpdeskMessage.messageVia',
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

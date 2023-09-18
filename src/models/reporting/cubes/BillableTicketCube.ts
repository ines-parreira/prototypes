import {TicketCube} from 'models/reporting/cubes/TicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum BillableTicketMeasure {
    AvgResolutionTime = 'avgResolutionTime',
    AvgFirstResponseTime = 'avgFirstResponseTime',
}

export enum BillableTicketDimension {
    TicketId = 'ticketId',
    AccountId = 'accountId',
    FirstHelpdeskMessageDatetime = 'firstHelpdeskMessageDatetime',
    FirstMessageChannel = 'firstMessageChannel',
    FirstHelpdeskMessageUserId = 'firstHelpdeskMessageUserId',
    BillableTicketCount = 'billableTicketCount',
}

type BillableTicketCube = Cube<
    BillableTicketMeasure,
    BillableTicketDimension,
    never
>

export type BillableTicketCubeWithJoins = JoinedCubesWithMapping<
    BillableTicketCube,
    TicketCube
>

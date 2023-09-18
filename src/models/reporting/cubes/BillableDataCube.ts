import {BillableTicketCubeWithJoins} from 'models/reporting/cubes/BillableTicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum BillableDataDimension {
    BillableTicketCount = 'BillableData.billableTicketCount',
    AccountId = 'BillableData.accountId',
    FirstMessageChannel = 'BillableData.firstMessageChannel',
    TicketId = 'BillableData.ticketId',
    AvgResolutionTime = 'BillableData.avgResolutionTime',
    AvgFirstResponseTime = 'BillableData.avgFirstResponseTime',
    TicketCreatedDate = 'BillableData.ticketCreatedDate',
}

type BillableDataCube = Cube<never, BillableDataDimension>

export type BillableDataCubeWithJoins = JoinedCubesWithMapping<
    BillableDataCube,
    BillableTicketCubeWithJoins
>

import {TicketCubeWithJoins} from 'models/reporting/cubes/TicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum HandleTimeMeasure {
    HandleTime = 'HandleTime.handleTime',
    AverageHandleTime = 'HandleTime.avgHandleTime',
    SumHandleTime = 'HandleTime.sumHandleTime',
}

export enum HandleTimeDimension {
    EntityId = 'HandleTime.entityId',
    AccountId = 'HandleTime.accountId',
    SessionId = 'HandleTime.sessionId',
    TicketHandleTime = 'HandleTime.ticketHandleTime',
    WorkingTime = 'HandleTime.workingTime',
    DraftingTime = 'HandleTime.draftingTime',
}

export enum HandleTimeMember {
    HandleTime = 'HandleTime.handleTime',
    AverageHandleTime = 'HandleTime.avgHandleTime',
    EntityId = 'HandleTime.entityId',
    AccountId = 'HandleTime.accountId',
    SessionId = 'HandleTime.sessionId',
}

export type HandleTimeCube = Cube<
    HandleTimeMeasure,
    HandleTimeDimension,
    HandleTimeMember
>

export type HandleTimeCubeWithJoins = JoinedCubesWithMapping<
    HandleTimeCube,
    TicketCubeWithJoins
>

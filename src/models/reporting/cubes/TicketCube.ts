import {TagsOnTicketCube} from 'models/reporting/cubes/TagsOnTicketCube'
import {TicketCustomFieldsCube} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketMessagesCube} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyCube} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketTagsCube} from 'models/reporting/cubes/TicketTagsCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum TicketMeasure {
    TicketCount = 'Ticket.ticketCount',
}

export enum TicketDimension {
    TicketId = 'Ticket.ticketId',
    PeriodStart = 'Ticket.periodStart',
    PeriodEnd = 'Ticket.periodEnd',
    AccountId = 'Ticket.accountId',
    Status = 'Ticket.status',
    Channel = 'Ticket.channel',
    CreatedDatetime = 'Ticket.createdDatetime',
    ClosedDatetime = 'Ticket.closedDatetime',
    AssigneeUserId = 'Ticket.assigneeUserId',
    AssigneeTeamId = 'Ticket.assigneeTeamId',
    IsTrashed = 'Ticket.isTrashed',
    IsSpam = 'Ticket.isSpam',
}

export enum TicketSegment {
    ClosedTickets = 'Ticket.closedTickets',
    WorkloadTickets = 'Ticket.workloadTickets',
}

export enum TicketMember {
    PeriodStart = 'Ticket.periodStart',
    PeriodEnd = 'Ticket.periodEnd',
    CreatedDatetime = 'Ticket.createdDatetime',
    AssigneeUserId = 'Ticket.assigneeUserId',
    IsTrashed = 'Ticket.isTrashed',
    IsSpam = 'Ticket.isSpam',
    Status = 'Ticket.status',
    Tags = 'Ticket.tags',
    Channel = 'Ticket.channel',
}

export type TicketTimeDimensions =
    | ValueOf<TicketDimension.CreatedDatetime>
    | ValueOf<TicketDimension.ClosedDatetime>

export type TicketCube = Cube<
    TicketMeasure,
    TicketDimension,
    TicketSegment,
    TicketMember,
    TicketTimeDimensions
>

export type TicketCubeWithJoins = JoinedCubesWithMapping<
    JoinedCubesWithMapping<
        JoinedCubesWithMapping<
            JoinedCubesWithMapping<
                JoinedCubesWithMapping<TicketCube, TicketMessagesCube>,
                TicketSatisfactionSurveyCube
            >,
            TicketTagsCube
        >,
        TagsOnTicketCube
    >,
    TicketCustomFieldsCube
>

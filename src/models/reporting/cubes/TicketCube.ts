import {TagsOnTicketCube} from 'models/reporting/cubes/TagsOnTicketCube'
import {TicketCustomFieldsCube} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TicketMessagesCube} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyCube} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketTagsCube} from 'models/reporting/cubes/TicketTagsCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum TicketMeasure {
    TicketCount = 'TicketEnriched.ticketCount',
}

export enum TicketDimension {
    TicketId = 'TicketEnriched.ticketId',
    PeriodStart = 'TicketEnriched.periodStart',
    PeriodEnd = 'TicketEnriched.periodEnd',
    AccountId = 'TicketEnriched.accountId',
    Status = 'TicketEnriched.status',
    Channel = 'TicketEnriched.channel',
    CustomField = 'TicketEnriched.customField',
    CustomFieldToExclude = 'TicketEnriched.customFieldToExclude',
    CreatedDatetime = 'TicketEnriched.createdDatetime',
    ClosedDatetime = 'TicketEnriched.closedDatetime',
    AssigneeUserId = 'TicketEnriched.assigneeUserId',
    AssigneeTeamId = 'TicketEnriched.assigneeTeamId',
    IsTrashed = 'TicketEnriched.isTrashed',
    IsSpam = 'TicketEnriched.isSpam',
}

export enum TicketSegment {
    ClosedTickets = 'TicketEnriched.closedTickets',
    WorkloadTickets = 'TicketEnriched.workloadTickets',
}

export enum TicketMember {
    PeriodStart = 'TicketEnriched.periodStart',
    PeriodEnd = 'TicketEnriched.periodEnd',
    CreatedDatetime = 'TicketEnriched.createdDatetime',
    AssigneeUserId = 'TicketEnriched.assigneeUserId',
    IsTrashed = 'TicketEnriched.isTrashed',
    IsSpam = 'TicketEnriched.isSpam',
    Status = 'TicketEnriched.status',
    Tags = 'TicketEnriched.tags',
    Channel = 'TicketEnriched.channel',
    CustomField = 'TicketEnriched.customField',
    CustomFieldToExclude = 'TicketEnriched.customFieldToExclude',
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

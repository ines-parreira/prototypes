import {TicketCube} from 'models/reporting/cubes/TicketCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum TicketSLAMeasure {
    TicketCount = 'TicketSLA.ticketCount',
}

export enum TicketSLADimension {
    TicketId = 'TicketSLA.ticketId',
    AccountId = 'TicketSLA.accountId',
    PeriodStart = 'TicketSLA.periodStart',
    PeriodEnd = 'TicketSLA.periodEnd',
    SlaStatus = 'TicketSLA.slaStatus',
    SlaAnchorDatetime = 'TicketSLA.slaAnchorDatetime',
    SlaAssignedDatetime = 'TicketSLA.slaAssignedDatetime',
    SlaPolicyMetricName = 'TicketSLA.slaPolicyMetricName',
    SlaPolicyMetricStatus = 'TicketSLA.slaPolicyMetricStatus',
    SlaDelta = 'TicketSLA.slaDelta',
}

export enum TicketSLASegment {
    PendingTickets = 'TicketSLA.pendingTickets',
    SatisfiedOrBreachedTickets = 'TicketSLA.satisfiedOrBreachedTickets',
    TicketsWithSlaAnchorDatetimeDuringSelectedPeriod = 'TicketSLA.ticketsWithSlaAnchorDatetimeDuringSelectedPeriod',
}

export enum TicketSLAMember {
    TicketId = 'TicketSLA.ticketId',
    AccountId = 'TicketSLA.accountId',
    PeriodStart = 'TicketSLA.periodStart',
    PeriodEnd = 'TicketSLA.periodEnd',
    SlaStatus = 'TicketSLA.slaStatus',
    SlaAnchorDatetime = 'TicketSLA.slaAnchorDatetime',
    SlaPolicyUuid = 'TicketSLA.slaPolicyUuid',
}

export enum TicketSLAStatus {
    Breached = 'BREACHED',
    Satisfied = 'SATISFIED',
    Pending = 'PENDING',
}

export type SatisfiedOrBreachedTicketSLAStatus =
    | TicketSLAStatus.Breached
    | TicketSLAStatus.Satisfied

export type TicketSLATimeDimensions =
    | ValueOf<TicketSLADimension.SlaAnchorDatetime>
    | ValueOf<TicketSLADimension.PeriodStart>
    | ValueOf<TicketSLADimension.PeriodEnd>

type TicketSLACube = Cube<
    TicketSLAMeasure,
    TicketSLADimension,
    TicketSLASegment,
    TicketSLAMember,
    TicketSLATimeDimensions
>
export type TicketSLACubeWithJoins = JoinedCubesWithMapping<
    TicketSLACube,
    TicketCube
>

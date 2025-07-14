import { Cube } from 'domains/reporting/models/types'

export enum AgentTimeTrackingMeasure {
    OnlineTime = 'AgentTimeTracking.onlineTime',
}

export enum AgentTimeTrackingDimension {
    AccountId = 'AgentTimeTracking.accountId',
    EntityId = 'AgentTimeTracking.entityId',
    SessionId = 'AgentTimeTracking.sessionId',
    UserId = 'AgentTimeTracking.userId',
}

export enum AgentTimeTrackingMember {
    AccountId = 'AgentTimeTracking.accountId',
    EntityId = 'AgentTimeTracking.entityId',
    PeriodEnd = 'AgentTimeTracking.periodEnd',
    PeriodStart = 'AgentTimeTracking.periodStart',
    SessionId = 'AgentTimeTracking.sessionId',
    UserId = 'AgentTimeTracking.userId',
}

export type AgentTimeTrackingCube = Cube<
    AgentTimeTrackingMeasure,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMember
>

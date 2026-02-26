import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import type { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { Cube } from 'domains/reporting/models/types'
import type { StatsFiltersMembers } from 'domains/reporting/utils/reporting'

export enum VoiceEventsByAgentMeasure {
    VoiceEventsCount = 'VoiceEventsByAgent.count',
}

export enum VoiceEventsByAgentDimension {
    PeriodStart = 'VoiceEventsByAgent.periodStart',
    PeriodEnd = 'VoiceEventsByAgent.periodEnd',
    IntegrationId = 'VoiceEventsByAgent.integrationId',
    AgentId = 'VoiceEventsByAgent.agentId',
    CreatedAt = 'VoiceEventsByAgent.createdAt',
    TicketId = 'VoiceEventsByAgent.ticketId',
    Status = 'VoiceEventsByAgent.status',
    TransferType = 'VoiceEventsByAgent.transferType',
    TransferTargetAgentId = 'VoiceEventsByAgent.transferTargetAgentId',
    TransferTargetExternalNumber = 'VoiceEventsByAgent.transferTargetExternalNumber',
    TransferTargetQueueId = 'VoiceEventsByAgent.transferTargetQueueId',
}

export enum VoiceEventsByAgentMember {
    PeriodStart = 'VoiceEventsByAgent.periodStart',
    PeriodEnd = 'VoiceEventsByAgent.periodEnd',
    IntegrationId = 'VoiceEventsByAgent.integrationId',
    AgentId = 'VoiceEventsByAgent.agentId',
    Store = 'VoiceEventsByAgent.store',
}

export enum VoiceEventsByAgentSegment {
    declinedCalls = 'VoiceEventsByAgent.declinedInboundCalls',
    callsInFinalStatus = 'VoiceEventsByAgent.callsInFinalStatus',
    transferredInboundCalls = 'VoiceEventsByAgent.transferredInboundCalls',
}

export const VoiceEventsByAgentFiltersMembers: StatsFiltersMembers = {
    periodStart: VoiceEventsByAgentMember.PeriodStart,
    periodEnd: VoiceEventsByAgentMember.PeriodEnd,
    integrations: VoiceEventsByAgentMember.IntegrationId,
    agents: VoiceEventsByAgentMember.AgentId,
    tags: TicketMember.Tags,
    stores: VoiceEventsByAgentMember.Store,
}

export type VoiceEventsByAgentCube = Cube<
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentDimension | VoiceCallDimension,
    VoiceEventsByAgentSegment,
    VoiceEventsByAgentMember,
    never
>

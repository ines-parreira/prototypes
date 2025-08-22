import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { Cube } from 'domains/reporting/models/types'
import { StatsFiltersMembers } from 'domains/reporting/utils/reporting'

export enum VoiceEventsByAgentMeasure {
    VoiceEventsCount = 'VoiceEventsByAgent.count',
}

export enum VoiceEventsByAgentDimension {
    PeriodStart = 'VoiceEventsByAgent.periodStart',
    PeriodEnd = 'VoiceEventsByAgent.periodEnd',
    IntegrationId = 'VoiceEventsByAgent.integrationId',
    AgentId = 'VoiceEventsByAgent.agentId',
}

export enum VoiceEventsByAgentMember {
    PeriodStart = 'VoiceEventsByAgent.periodStart',
    PeriodEnd = 'VoiceEventsByAgent.periodEnd',
    IntegrationId = 'VoiceEventsByAgent.integrationId',
    AgentId = 'VoiceEventsByAgent.agentId',
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
}

export type VoiceEventsByAgentCube = Cube<
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentSegment,
    VoiceEventsByAgentMember,
    never
>

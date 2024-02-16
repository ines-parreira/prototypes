import {Cube} from 'models/reporting/types'
import {StatsFiltersMembers} from 'utils/reporting'
import {TicketMember} from './TicketCube'

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

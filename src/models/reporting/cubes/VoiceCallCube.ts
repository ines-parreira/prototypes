import {Cube} from 'models/reporting/types'
import {StatsFiltersMembers} from 'utils/reporting'

export enum VoiceCallMeasure {
    VoiceCallCount = 'VoiceCall.count',
}

export enum VoiceCallDimension {
    CreatedAt = 'VoiceCall.createdAt',
    PeriodStart = 'VoiceCall.periodStart',
    PeriodEnd = 'VoiceCall.periodEnd',
    Direction = 'VoiceCall.direction',
    IntegrationId = 'VoiceCall.integrationId',
    Status = 'VoiceCall.status',
    Duration = 'VoiceCall.duration',
    TicketId = 'VoiceCall.ticketId',
    AgentId = 'VoiceCall.agentId',
    CustomerId = 'VoiceCall.customerId',
    TalkTime = 'VoiceCall.talkTime',
    WaitTime = 'VoiceCall.waitTime',
    PhoneNumberSource = 'VoiceCall.phoneNumberSource',
    PhoneNumberDestination = 'VoiceCall.phoneNumberDestination',
}

export enum VoiceCallMember {
    PeriodStart = 'VoiceCall.periodStart',
    PeriodEnd = 'VoiceCall.periodEnd',
    IntegrationId = 'VoiceCall.integrationId',
    AgentId = 'VoiceCall.agentId',
}

export enum VoiceCallSegment {
    inboundCalls = 'VoiceCall.inboundCalls',
    outboundCalls = 'VoiceCall.outboundCalls',
    missedCalls = 'VoiceCall.missedCalls',
}

export const VoiceCallFiltersMembers: StatsFiltersMembers = {
    periodStart: VoiceCallMember.PeriodStart,
    periodEnd: VoiceCallMember.PeriodEnd,
    integrations: VoiceCallMember.IntegrationId,
    agents: VoiceCallMember.AgentId,
}

export type VoiceCallCube = Cube<
    VoiceCallMeasure,
    VoiceCallDimension,
    VoiceCallSegment,
    VoiceCallMember,
    never
>

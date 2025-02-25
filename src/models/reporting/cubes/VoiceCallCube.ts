import { Cube } from 'models/reporting/types'
import { StatsFiltersMembers } from 'utils/reporting'

import { TicketMember } from './TicketCube'

export enum VoiceCallMeasure {
    VoiceCallCount = 'VoiceCall.count',
    VoiceCallAverageTalkTime = 'VoiceCall.averageTalkTimeSeconds',
    VoiceCallAverageWaitTime = 'VoiceCall.averageWaitTimeSeconds',
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
    TalkTime = 'VoiceCall.talkTimeSeconds',
    WaitTime = 'VoiceCall.waitTimeSeconds',
    PhoneNumberSource = 'VoiceCall.phoneNumberSource',
    PhoneNumberDestination = 'VoiceCall.phoneNumberDestination',
    FilteringAgentId = 'VoiceCall.filteringAgentId',
    VoicemailAvailable = 'VoiceCall.voicemailAvailable',
    VoicemailUrl = 'VoiceCall.voicemailUrl',
    CallRecordingAvailable = 'VoiceCall.callRecordingAvailable',
    CallRecordingUrl = 'VoiceCall.callRecordingUrl',
    DisplayStatus = 'VoiceCall.displayStatus',
}

export enum VoiceCallMember {
    PeriodStart = 'VoiceCall.periodStart',
    PeriodEnd = 'VoiceCall.periodEnd',
    IntegrationId = 'VoiceCall.integrationId',
    AgentId = 'VoiceCall.filteringAgentId',
    AssignedAgentId = 'VoiceCall.agentId',
    TalkTime = 'VoiceCall.talkTimeSeconds',
    WaitTime = 'VoiceCall.waitTimeSeconds',
}

export enum VoiceCallSegment {
    inboundCalls = 'VoiceCall.inboundCalls',
    outboundCalls = 'VoiceCall.outboundCalls',
    missedCalls = 'VoiceCall.missedCalls',
    inboundUnansweredCalls = 'VoiceCall.inboundUnansweredCalls',
    inboundMissedCalls = 'VoiceCall.inboundMissedCalls',
    inboundAbandonedCalls = 'VoiceCall.inboundAbandonedCalls',
    inboundCancelledCalls = 'VoiceCall.inboundCancelledCalls',
    missedCallsByAgent = 'VoiceCall.missedCallsByAgent',
    answeredCallsByAgent = 'VoiceCall.answeredCallsByAgent',
}

export const VoiceCallFiltersMembers: StatsFiltersMembers = {
    periodStart: VoiceCallMember.PeriodStart,
    periodEnd: VoiceCallMember.PeriodEnd,
    integrations: VoiceCallMember.IntegrationId,
    agents: VoiceCallMember.AgentId,
    tags: TicketMember.Tags,
    customFields: TicketMember.CustomField,
    score: TicketMember.SurveyScore,
    resolutionCompleteness: TicketMember.ResolutionCompletenessScore,
    communicationSkills: TicketMember.CommunicationSkillsScore,
    languageProficiency: TicketMember.LanguageProficiencyScore,
}

export type VoiceCallCube = Cube<
    VoiceCallMeasure,
    VoiceCallDimension,
    VoiceCallSegment,
    VoiceCallMember,
    never
>

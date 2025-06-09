import { Cube } from 'models/reporting/types'
import { FilterKey } from 'models/stat/types'
import { StatsFiltersMembers } from 'utils/reporting'

import { TicketMember } from './TicketCube'

export enum VoiceCallMeasure {
    VoiceCallCount = 'VoiceCall.count',
    VoiceCallAverageTalkTime = 'VoiceCall.averageTalkTimeSeconds',
    VoiceCallAverageWaitTime = 'VoiceCall.averageWaitTimeSeconds',
}

export enum VoiceCallDimension {
    IsDuringBusinessHours = 'VoiceCall.isDuringBusinessHours',
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
    QueueId = 'VoiceCall.queueId',
    QueueName = 'VoiceCall.queueName',
}

export enum VoiceCallMember {
    IsDuringBusinessHours = 'VoiceCall.isDuringBusinessHours',
    PeriodStart = 'VoiceCall.periodStart',
    PeriodEnd = 'VoiceCall.periodEnd',
    IntegrationId = 'VoiceCall.integrationId',
    AgentId = 'VoiceCall.filteringAgentId',
    AssignedAgentId = 'VoiceCall.agentId',
    TalkTime = 'VoiceCall.talkTimeSeconds',
    WaitTime = 'VoiceCall.waitTimeSeconds',
    DisplayStatus = 'VoiceCall.displayStatus',
    QueueId = 'VoiceCall.queueId',
}

export enum VoiceCallSegment {
    inboundCalls = 'VoiceCall.inboundCalls',
    outboundCalls = 'VoiceCall.outboundCalls',
    inboundUnansweredCalls = 'VoiceCall.inboundUnansweredCalls',
    inboundMissedCalls = 'VoiceCall.inboundMissedCalls',
    inboundAbandonedCalls = 'VoiceCall.inboundAbandonedCalls',
    inboundCancelledCalls = 'VoiceCall.inboundCancelledCalls',
    inboundCallbackRequestedCalls = 'VoiceCall.inboundCallbackRequestedCalls',
    inboundUnansweredCallsByAgent = 'VoiceCall.inboundUnansweredCallsByAgent',
    inboundAnsweredCallsByAgent = 'VoiceCall.inboundAnsweredCallsByAgent',
    callsInFinalStatus = 'VoiceCall.callsInFinalStatus',
}

export const VoiceCallFiltersMembers: StatsFiltersMembers = {
    periodStart: VoiceCallMember.PeriodStart,
    periodEnd: VoiceCallMember.PeriodEnd,
    integrations: VoiceCallMember.IntegrationId,
    agents: VoiceCallMember.AgentId,
    [FilterKey.IsDuringBusinessHours]: VoiceCallMember.IsDuringBusinessHours,
    tags: TicketMember.Tags,
    customFields: TicketMember.CustomField,
    score: TicketMember.SurveyScore,
    resolutionCompleteness: TicketMember.ResolutionCompletenessScore,
    communicationSkills: TicketMember.CommunicationSkillsScore,
    languageProficiency: TicketMember.LanguageProficiencyScore,
    voiceQueues: VoiceCallMember.QueueId,
}

export type VoiceCallCube = Cube<
    VoiceCallMeasure,
    VoiceCallDimension,
    VoiceCallSegment,
    VoiceCallMember,
    never
>

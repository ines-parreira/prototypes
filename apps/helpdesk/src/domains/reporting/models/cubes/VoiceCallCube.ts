import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { Cube } from 'domains/reporting/models/types'
import type { StatsFiltersMembers } from 'domains/reporting/utils/reporting'

export enum VoiceCallMeasure {
    VoiceCallCount = 'VoiceCall.count',
    VoiceCallAverageTalkTime = 'VoiceCall.averageTalkTimeSeconds',
    VoiceCallAverageWaitTime = 'VoiceCall.averageWaitTimeSeconds',
    SlaAchievementRate = 'VoiceQueueExposure.slaAchievementRate',
    BreachedExposures = 'VoiceCall.breachedExposures',
    AchievedExposures = 'VoiceCall.achievedExposures',
}

export enum VoiceCallDimension {
    IsDuringBusinessHours = 'VoiceCall.isDuringBusinessHours',
    CallSlaStatus = 'VoiceCall.callSlaStatus',
    CreatedAt = 'VoiceCall.createdAt',
    PeriodStart = 'VoiceCall.periodStart',
    PeriodEnd = 'VoiceCall.periodEnd',
    Direction = 'VoiceCall.direction',
    IntegrationId = 'VoiceCall.integrationId',
    Store = 'VoiceCall.store',
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
    IsPossibleSpam = 'VoiceCall.isPossibleSpam',
}

export enum VoiceCallMember {
    IsDuringBusinessHours = 'VoiceCall.isDuringBusinessHours',
    PeriodStart = 'VoiceCall.periodStart',
    PeriodEnd = 'VoiceCall.periodEnd',
    IntegrationId = 'VoiceCall.integrationId',
    Store = 'VoiceCall.store',
    AgentId = 'VoiceCall.filteringAgentId',
    AssignedAgentId = 'VoiceCall.agentId',
    TalkTime = 'VoiceCall.talkTimeSeconds',
    WaitTime = 'VoiceCall.waitTimeSeconds',
    DisplayStatus = 'VoiceCall.displayStatus',
    QueueId = 'VoiceCall.queueId',
    SlaStatus = 'VoiceCall.callSlaStatus',
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
    callSlaBreached = 'VoiceCall.callSlaBreached',
}

export const VoiceCallFiltersMembers: StatsFiltersMembers = {
    periodStart: VoiceCallMember.PeriodStart,
    periodEnd: VoiceCallMember.PeriodEnd,
    integrations: VoiceCallMember.IntegrationId,
    agents: VoiceCallMember.AgentId,
    [FilterKey.IsDuringBusinessHours]: VoiceCallMember.IsDuringBusinessHours,
    tags: TicketMember.Tags,
    customFields: TicketMember.CustomField,
    voiceQueues: VoiceCallMember.QueueId,
    stores: VoiceCallMember.Store,
}

export type VoiceCallCube = Cube<
    VoiceCallMeasure,
    VoiceCallDimension,
    VoiceCallSegment,
    VoiceCallMember,
    never
>

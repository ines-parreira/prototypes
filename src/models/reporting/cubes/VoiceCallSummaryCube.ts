import { Cube } from 'models/reporting/types'
import { FilterKey } from 'models/stat/types'
import { StatsFiltersMembers } from 'utils/reporting'

export enum VoiceCallSummaryMeasure {
    VoiceCallSummaryTotal = 'VoiceCallSummary.total',
    VoiceCallSummaryInboundTotal = 'VoiceCallSummary.inboundTotal',
    VoiceCallSummaryOutboundTotal = 'VoiceCallSummary.outboundTotal',
    VoiceCallSummaryAnsweredTotal = 'VoiceCallSummary.answeredTotal',
    VoiceCallSummaryCancelledTotal = 'VoiceCallSummary.cancelledTotal',
    VoiceCallSummaryAbandonedTotal = 'VoiceCallSummary.abandonedTotal',
    VoiceCallSummaryMissedTotal = 'VoiceCallSummary.missedTotal',
    VoiceCallSummaryUnansweredTotal = 'VoiceCallSummary.unansweredTotal',
    VoiceCallSummaryCallbackRequestedTotal = 'VoiceCallSummary.callbackRequestedTotal',
    VoiceCallSummaryAverageTalkTime = 'VoiceCallSummary.averageTalkTimeSeconds',
    VoiceCallSummaryAverageWaitTime = 'VoiceCallSummary.averageWaitTimeSeconds',
}

export enum VoiceCallSummaryDimension {
    PeriodStart = 'VoiceCallSummary.periodStart',
    PeriodEnd = 'VoiceCallSummary.periodEnd',
    IntegrationId = 'VoiceCallSummary.integrationId',
    FilteringAgentId = 'VoiceCallSummary.filteringAgentId',
    QueueId = 'VoiceCallSummary.queueId',
}

export enum VoiceCallSummaryMember {
    IsDuringBusinessHours = 'VoiceCallSummary.isDuringBusinessHours',
    PeriodStart = 'VoiceCallSummary.periodStart',
    PeriodEnd = 'VoiceCallSummary.periodEnd',
    IntegrationId = 'VoiceCallSummary.integrationId',
    AgentId = 'VoiceCallSummary.filteringAgentId',
    QueueId = 'VoiceCallSummary.queueId',
}

export const VoiceCallSummaryFiltersMembers: StatsFiltersMembers = {
    periodStart: VoiceCallSummaryMember.PeriodStart,
    periodEnd: VoiceCallSummaryMember.PeriodEnd,
    integrations: VoiceCallSummaryMember.IntegrationId,
    agents: VoiceCallSummaryMember.AgentId,
    [FilterKey.IsDuringBusinessHours]:
        VoiceCallSummaryMember.IsDuringBusinessHours,
    voiceQueues: VoiceCallSummaryMember.QueueId,
}

export type VoiceCallSummaryCube = Cube<
    VoiceCallSummaryMeasure,
    VoiceCallSummaryDimension,
    never,
    never,
    never
>

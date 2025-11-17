import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

export const VoiceMetricsConfig: Record<
    VoiceMetric,
    {
        showMetric: boolean
        domain: Domain.Voice
        drillDownQuery: DrillDownQueryFactory
        title: string
    }
> = {
    [VoiceMetric.AverageWaitTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            waitingTimeCallsListQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.AverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            connectedCallsListQueryFactory(statsFilters, timezone),
        title: '',
    },
    [VoiceMetric.QueueAverageWaitTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashboardWaitingTimeCallsListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueAverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashboardConnectedCallsListQueryFactory(statsFilters),
        title: '',
    },
    [VoiceMetric.QueueInboundCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueOutboundCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.outboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundUnansweredCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundUnansweredCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundMissedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundMissedCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundAbandonedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundAbandonedCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundCancelledCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCancelledCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueInboundCallbackRequestedCalls]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCallbackRequestedCalls,
            ),
        title: '',
    },
}

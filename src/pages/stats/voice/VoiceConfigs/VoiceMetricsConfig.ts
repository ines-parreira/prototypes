import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import {
    Domain,
    DrillDownQueryFactory,
} from 'pages/stats/common/drill-down/types'
import { VoiceMetric } from 'state/ui/stats/types'

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

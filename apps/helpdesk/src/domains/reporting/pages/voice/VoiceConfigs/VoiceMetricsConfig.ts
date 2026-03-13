import type { TooltipData } from '@repo/reporting'

import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    voiceCallListWithSlaStatusQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { BuiltQuery, Context } from 'domains/reporting/models/scopes/scope'
import type { VoiceCallsContext } from 'domains/reporting/models/scopes/voiceCalls'
import {
    voiceCallsCountAllDimensionsQueryFactoryV2,
    voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2,
    voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
    voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2,
    voiceConnectedAllDimensionsQueryFactoryV2,
    voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2,
    voiceWaitTimeCallsAllDimensionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import {
    SLA_ACHIEVEMENT_RATE_METRIC_HINT,
    SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/liveVoice'
import { useVoiceCallSlaAchievementRateTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'

export const VoiceMetricsConfig: Record<
    VoiceMetric,
    {
        hint?: TooltipData
        useTrend?: MetricTrendHook
        interpretAs?: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat?: MetricTrendFormat
        drillDownMetric?: VoiceMetric
        drillDownTitle?: string
        showMetric: boolean
        domain: Domain.Voice
        drillDownQuery: DrillDownQueryFactory
        drillDownQueryV2?: (ctx: Context) => BuiltQuery
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
        drillDownQueryV2: (ctx: Context) =>
            voiceWaitTimeCallsAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.AverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            connectedCallsListQueryFactory(statsFilters, timezone),
        drillDownQueryV2: (ctx: Context) =>
            voiceConnectedAllDimensionsQueryFactoryV2(ctx as VoiceCallsContext),
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
        drillDownQueryV2: (ctx: Context) =>
            voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
                VoiceCallSegment.inboundCalls,
            ),
        title: '',
    },
    [VoiceMetric.QueueAverageTalkTime]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashboardConnectedCallsListQueryFactory(statsFilters),
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
            ),
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
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
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
                VoiceCallSegment.inboundCallbackRequestedCalls,
            ),
        title: '',
    },
    [VoiceMetric.VoiceCallsAchievementRate]: {
        showMetric: false,
        domain: Domain.Voice,
        useTrend: useVoiceCallSlaAchievementRateTrend,
        drillDownMetric: VoiceMetric.VoiceCallsAchievementRate,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListWithSlaStatusQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.inboundCalls,
            ),
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
            ),
        title: SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
        hint: { title: SLA_ACHIEVEMENT_RATE_METRIC_HINT },
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
    [VoiceMetric.QueueCallsAchievementRate]: {
        showMetric: false,
        domain: Domain.Voice,
        useTrend: useVoiceCallSlaAchievementRateTrend,
        drillDownMetric: VoiceMetric.VoiceCallsAchievementRate,
        drillDownQuery: (statsFilters: StatsFilters) =>
            liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls,
            ),
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
                VoiceCallSegment.inboundCalls,
            ),
        title: SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
        hint: { title: SLA_ACHIEVEMENT_RATE_METRIC_HINT },
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
    [VoiceMetric.VoiceCallsBreachedRate]: {
        showMetric: false,
        domain: Domain.Voice,
        drillDownQuery: (statsFilters: StatsFilters, timezone: string) =>
            voiceCallListQueryFactory(
                statsFilters,
                timezone,
                VoiceCallSegment.callSlaBreached,
            ),
        drillDownQueryV2: (ctx: Context) =>
            voiceCallsCountAllDimensionsQueryFactoryV2(
                ctx as VoiceCallsContext,
                VoiceCallSegment.callSlaBreached,
            ),
        title: '',
    },
}

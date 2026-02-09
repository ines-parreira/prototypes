import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const voiceCallsSummaryScope = defineScope({
    scope: MetricScope.VoiceCallsSummary,
    measures: [
        'abandonedVoiceCallsCount',
        'answeredVoiceCallsCount',
        'averageTalkTimeInSeconds',
        'averageWaitTimeInSeconds',
        'callbackRequestedVoiceCallsCount',
        'cancelledVoiceCallsCount',
        'inboundVoiceCallsCount',
        'missedVoiceCallsCount',
        'outboundVoiceCallsCount',
        'slaAchievementRate',
        'unansweredVoiceCallsCount',
    ],
    dimensions: [],
    timeDimensions: [],
    order: [],
    filters: [
        'agentId',
        'integrationId',
        'isDuringBusinessHours',
        'periodEnd',
        'periodStart',
        'queueId',
    ],
})

export type VoiceCallsSummaryContext = Context<
    typeof voiceCallsSummaryScope.config
>

export const voiceCallsSummaryMetrics = voiceCallsSummaryScope
    .defineMetricName(METRIC_NAMES.VOICE_CALL_SUMMARY)
    .defineQuery(() => ({
        measures: [
            'inboundVoiceCallsCount',
            'outboundVoiceCallsCount',
            'answeredVoiceCallsCount',
            'cancelledVoiceCallsCount',
            'abandonedVoiceCallsCount',
            'missedVoiceCallsCount',
            'unansweredVoiceCallsCount',
            'callbackRequestedVoiceCallsCount',
            'averageTalkTimeInSeconds',
            'averageWaitTimeInSeconds',
            'slaAchievementRate',
        ] as const,
    }))

export const voiceCallsSummaryMetricsQueryFactoryV2 = (
    ctx: VoiceCallsSummaryContext,
) => {
    return voiceCallsSummaryMetrics.build(ctx)
}

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    type Context,
    defineScope,
} from 'domains/reporting/models/scopes/scope'

const voiceSLAScope = defineScope({
    scope: MetricScope.VoiceServiceLevelAgreement,
    measures: ['slaAchievementRate', 'breachedExposures', 'achievedExposures'],
    timeDimensions: ['queuedDate'],
    order: [],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'integrationId',
        'queueId',
        'storeId',
        'tags',
    ],
})

type VoiceSLAContext = Context<typeof voiceSLAScope.config>

export const voiceCallsSlaAchievementRate = voiceSLAScope
    .defineMetricName(METRIC_NAMES.SLA_ACHIEVEMENT_RATE_VOICE_CALLS)
    .defineQuery(() => {
        const query = {
            measures: ['slaAchievementRate'] as const,
        }

        return query
    })

export const voiceCallsSlaAchievementRateQueryV2Factory = (
    ctx: VoiceSLAContext,
) => voiceCallsSlaAchievementRate.build(ctx)

export const breachedVoiceCalls = voiceSLAScope
    .defineMetricName(METRIC_NAMES.SLA_BREACHED_VOICE_CALLS)
    .defineQuery(() => {
        const query = {
            measures: ['breachedExposures'] as const,
        }

        return query
    })

export const breachedVoiceCallsQueryV2Factory = (ctx: VoiceSLAContext) =>
    breachedVoiceCalls.build(ctx)

export const satisfiedOrBreachedVoiceCallsTimeseries = voiceSLAScope
    .defineMetricName(
        METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_VOICE_CALLS_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['achievedExposures', 'breachedExposures'] as const,
        time_dimensions: [
            {
                dimension: 'queuedDate',
                granularity: ctx.granularity,
            },
        ],
    }))

export const satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory = (
    ctx: VoiceSLAContext,
) => satisfiedOrBreachedVoiceCallsTimeseries.build(ctx)

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { ApiOnlyOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const voiceSLAScope = defineScope({
    scope: MetricScope.VoiceServiceLevelAgreement,
    dimensions: ['callSlaStatusLabel'],
    measures: [
        'slaAchievementRate',
        'breachedExposures',
        'achievedExposures',
        'totalExposures',
    ],
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
        'callSlaStatus',
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
    .defineQuery(({ ctx, config }) => ({
        measures: ['totalExposures'],
        dimensions: ['callSlaStatusLabel'],
        time_dimensions: [
            {
                dimension: 'queuedDate',
                granularity: ctx.granularity,
            },
        ],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'callSlaStatus' as const,
                operator: ApiOnlyOperatorEnum.SET,
                values: [] as string[],
            },
        ] as any,
    }))

export const satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory = (
    ctx: VoiceSLAContext,
) => satisfiedOrBreachedVoiceCallsTimeseries.build(ctx)

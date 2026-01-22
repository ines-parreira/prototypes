import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    type Context,
    defineScope,
} from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

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
    ],
})

type VoiceSLAContext = Context<typeof voiceSLAScope.config>

export const satisfiedOrBreachedVoiceCallsTimeseries = voiceSLAScope
    .defineMetricName(
        METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_VOICE_CALLS_TIME_SERIES,
    )
    .defineQuery(({ ctx, config }) => ({
        measures: ['breachedExposures', 'achievedExposures'] as const,
        time_dimensions: [
            {
                dimension: 'queuedDate',
                granularity: ctx.granularity,
            },
        ],
        filters: [...createScopeFilters(ctx.filters, config)] as any,
        limit: 10_000,
    }))

export const satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory = (
    ctx: VoiceSLAContext,
) => satisfiedOrBreachedVoiceCallsTimeseries.build(ctx)

export enum VoiceSLAStatus {
    Breached = '1',
    Satisfied = '0',
}

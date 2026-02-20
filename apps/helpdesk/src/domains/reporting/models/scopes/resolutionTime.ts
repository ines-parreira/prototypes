import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const resolutionTimeScope = defineScope({
    scope: MetricScope.ResolutionTime,
    measures: ['medianResolutionTime'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'resolutionTime',
    ],
    timeDimensions: ['createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'integrationId',
        'storeId',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'customFields',
        'tags',
        'score',
    ],
    order: ['tickets', 'medianResolutionTime'],
})

export const medianResolutionTime = resolutionTimeScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME)
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
    }))

export const medianResolutionTimeQueryV2Factory = (ctx: Context) =>
    medianResolutionTime.build(ctx)

export const medianResolutionTimePerAgent = resolutionTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianResolutionTime'] as const,
            dimensions: ['agentId'] as const,
            limit: 10000,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['medianResolutionTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const medianResolutionTimePerAgentQueryV2Factory = (ctx: Context) =>
    medianResolutionTimePerAgent.build(ctx)

export const medianResolutionTimePerChannel = resolutionTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
        dimensions: ['channel'] as const,
    }))

export const medianResolutionTimePerChannelQueryV2Factory = (ctx: Context) =>
    medianResolutionTimePerChannel.build(ctx)

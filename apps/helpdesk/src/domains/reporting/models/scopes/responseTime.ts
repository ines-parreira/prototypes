import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const responseTimeScope = defineScope({
    scope: MetricScope.ResponseTime,
    measures: ['medianResponseTime'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId', 'storeId'],
    timeDimensions: ['createdDatetime'],
    order: ['createdDatetime', 'medianResponseTime', 'ticketId'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'score',
        'integrationId',
        'tags',
        'customFields',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'storeId',
    ],
})

export const medianResponseTime = responseTimeScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianResponseTime'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['medianResponseTime', ctx.sortDirection]],
            }
        }
        return query
    })

export const medianResponseTimeQueryV2Factory = (ctx: Context) =>
    medianResponseTime.build(ctx)

export const medianResponseTimePerAgent = responseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianResponseTime'] as const,
            dimensions: ['agentId'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['medianResponseTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const medianResponseTimePerAgentQueryV2Factory = (ctx: Context) =>
    medianResponseTimePerAgent.build(ctx)

export const medianResponseTimePerChannel = responseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianResponseTime'] as const,
            dimensions: ['channel'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['medianResponseTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const medianResponseTimePerChannelQueryV2Factory = (ctx: Context) =>
    medianResponseTimePerChannel.build(ctx)

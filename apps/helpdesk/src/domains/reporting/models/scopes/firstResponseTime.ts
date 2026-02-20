import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const firstResponseTimeScope = defineScope({
    scope: MetricScope.FirstResponseTime,
    measures: ['medianFirstResponseTime', 'medianFirstResponseTimeInSeconds'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'firstResponseTime',
    ],
    timeDimensions: ['createdDatetime', 'firstAgentMessageDatetime'],
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
    order: [
        'tickets',
        'createdDatetime',
        'firstAgentMessageDatetime',
        'medianFirstResponseTime',
    ],
})

type FirstResponseTimeContext = Context<typeof firstResponseTimeScope.config>

export const medianFirstResponseTime = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimeQueryV2Factory = (
    ctx: FirstResponseTimeContext,
) => medianFirstResponseTime.build(ctx)

export const medianFirstResponseTimePerAgent = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
            dimensions: ['agentId'] as const,
            limit: 10_000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimePerAgentQueryV2Factory = (
    ctx: FirstResponseTimeContext,
) => medianFirstResponseTimePerAgent.build(ctx)

export const medianFirstResponseTimePerChannel = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimePerChannelQueryV2Factory = (
    ctx: FirstResponseTimeContext,
) => medianFirstResponseTimePerChannel.build(ctx)

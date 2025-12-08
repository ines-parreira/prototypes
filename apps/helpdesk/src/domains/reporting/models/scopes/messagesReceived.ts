import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const messagesReceivedScope = defineScope({
    scope: MetricScope.MessagesReceived,
    measures: ['messagesCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['sentDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'accuracy',
        'agents',
        'brandVoice',
        'channel',
        'communicationSkills',
        'score',
        'customFields',
        'efficiency',
        'integrations',
        'internalCompliance',
        'languageProficiency',
        'resolutionCompleteness',
        'stores',
        'tags',
        'teams',
    ],
    order: ['ticketId', 'messagesCount'],
})

export const messagesReceivedCount = messagesReceivedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['messagesCount'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['messagesCount', ctx.sortDirection]],
            }
        }
        return query
    })

export const messagesReceivedCountQueryV2Factory = (ctx: Context) =>
    messagesReceivedCount.build(ctx)

export const messagesReceivedPerAgent = messagesReceivedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['messagesCount'] as const,
            dimensions: ['agentId'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['messagesCount', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const messagesReceivedPerAgentQueryV2Factory = (ctx: Context) =>
    messagesReceivedPerAgent.build(ctx)

export const messagesReceivedPerChannel = messagesReceivedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['messagesCount'] as const,
            dimensions: ['channel'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['messagesCount', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const messagesReceivedPerChannelQueryV2Factory = (ctx: Context) =>
    messagesReceivedPerChannel.build(ctx)

export const messagesReceivedTimeSeries = messagesReceivedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['messagesCount'] as const,
        time_dimensions: [
            {
                dimension: 'sentDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
    }))

export const messagesReceivedTimeSeriesQueryV2Factory = (ctx: Context) =>
    messagesReceivedTimeSeries.build(ctx)

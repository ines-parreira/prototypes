import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { Context, defineScope } from 'domains/reporting/models/scopes/scope'

const messagesSentScope = defineScope({
    scope: MetricScope.MessagesSent,
    measures: ['messagesCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['sentDatetime'],
    order: ['ticketId', 'messagesCount'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'score',
        'integrations',
        'stores',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'customFields',
        'tags',
    ],
})

export const sentMessagesCount = messagesSentScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT)
    .defineQuery(() => ({
        measures: ['messagesCount'] as const,
    }))

export const sentMessagesCountQueryV2Factory = (ctx: Context) =>
    sentMessagesCount.build(ctx)

export const sentMessagesTimeseries = messagesSentScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_TIME_SERIES,
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

export const sentMessagesTimeseriesQueryV2Factory = (ctx: Context) =>
    sentMessagesTimeseries.build(ctx)

export const sentMessagesPerAgent = messagesSentScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_AGENT)
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

export const sentMessagesPerAgentQueryV2Factory = (ctx: Context) =>
    sentMessagesPerAgent.build(ctx)

export const sentMessagesPerChannel = messagesSentScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_CHANNEL,
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

export const sentMessagesPerChannelQueryV2Factory = (ctx: Context) =>
    sentMessagesPerChannel.build(ctx)

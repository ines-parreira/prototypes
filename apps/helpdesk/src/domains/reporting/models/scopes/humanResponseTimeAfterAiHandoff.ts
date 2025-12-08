import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const humanResponseTimeAfterAiHandoffScope = defineScope({
    scope: MetricScope.HumanFirstResponseTime,
    measures: ['medianFirstResponseTime'],
    dimensions: [
        'agentId',
        'channel',
        'firstResponseTime',
        'integrationId',
        'ticketId',
    ],
    timeDimensions: [
        'firstAgentMessageDatetime',
        'createdDatetime',
        'sentDatetime',
    ],
    order: ['createdDatetime', 'medianFirstResponseTime', 'ticketId'],
    filters: [
        'periodStart',
        'periodEnd',
        'accuracy',
        'agents',
        'brandVoice',
        'channel',
        'communicationSkills',
        'customFields',
        'efficiency',
        'integrations',
        'internalCompliance',
        'languageProficiency',
        'resolutionCompleteness',
        'score',
        'stores',
        'tags',
        'teams',
    ],
})

export const humanResponseTimeAfterAiHandoff =
    humanResponseTimeAfterAiHandoffScope
        .defineMetricName(
            METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF,
        )
        .defineQuery(({ ctx }) => {
            const query = {
                measures: ['medianFirstResponseTime'] as const,
            }
            if (ctx.sortDirection) {
                return {
                    ...query,
                    order: [['medianFirstResponseTime', ctx.sortDirection]],
                }
            }
            return query
        })

export const humanResponseTimeAfterAiHandoffQueryV2Factory = (ctx: Context) =>
    humanResponseTimeAfterAiHandoff.build(ctx)

export const humanResponseTimeAfterAiHandoffPerAgent =
    humanResponseTimeAfterAiHandoffScope
        .defineMetricName(
            METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF_PER_AGENT,
        )
        .defineQuery(({ ctx }) => {
            const query = {
                measures: ['medianFirstResponseTime'] as const,
                dimensions: ['agentId'] as const,
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

export const humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory = (
    ctx: Context,
) => humanResponseTimeAfterAiHandoffPerAgent.build(ctx)

export const humanResponseTimeAfterAiHandoffPerChannel =
    humanResponseTimeAfterAiHandoffScope
        .defineMetricName(
            METRIC_NAMES.SUPPORT_PERFORMANCE_HUMAN_RESPONSE_TIME_AFTER_AI_HANDOFF_PER_CHANNEL,
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

export const humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory = (
    ctx: Context,
) => humanResponseTimeAfterAiHandoffPerChannel.build(ctx)

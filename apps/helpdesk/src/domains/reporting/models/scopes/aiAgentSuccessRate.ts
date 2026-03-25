import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentSuccessRateScope = defineScope({
    scope: MetricScope.AiAgentSuccessRate,
    measures: ['successRate'],
    dimensions: [
        'aiAgentSkill',
        'aiIntentCustomField',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'channel',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['eventDatetime', 'successRate', 'ticketId'],
})

export type AiAgentSuccessRateContext = Context<
    typeof aiAgentSuccessRateScope.config
>

export const aiAgentSuccessRatePerChannel = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUCCESS_RATE_PER_CHANNEL)
    .defineQuery(() => ({
        measures: ['successRate'] as const,
        dimensions: ['channel'],
    }))

export const aiAgentSuccessRatePerChannelQueryFactoryV2 = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentSuccessRatePerChannel.build(ctx)

export const aiAgentSuccessRatePerIntent = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUCCESS_RATE_PER_INTENT)
    .defineQuery(() => ({
        measures: ['successRate'] as const,
        dimensions: ['aiIntentCustomField'],
    }))

export const aiAgentSuccessRatePerIntentQueryFactoryV2 = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentSuccessRatePerIntent.build(ctx)

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentSuccessRateScope = defineScope({
    scope: MetricScope.AiAgentSuccessRate,
    measures: ['successRate'],
    dimensions: [
        'aiAgentRole',
        'aiIntentCustomField',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
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

export const aiAgentAllAgentsSuccessRateTrend = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_ALL_AGENTS_SUCCESS_RATE)
    .defineQuery(() => ({
        measures: ['successRate'] as const,
    }))

export const aiAgentAllAgentsSuccessRateTrendQueryFactory = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentAllAgentsSuccessRateTrend.build(ctx)

export const aiSupportAgentSuccessRateTrend = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_SUCCESS_RATE)
    .defineQuery(({ ctx, config }) => ({
        measures: ['successRate'] as const,
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'aiAgentRole',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationSkillType.AiAgentSupport],
            },
        ] as any,
    }))

export const aiSupportAgentSuccessRateTrendQueryFactory = (
    ctx: AiAgentSuccessRateContext,
) => aiSupportAgentSuccessRateTrend.build(ctx)

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

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentSuccessRateScope = defineScope({
    scope: MetricScope.AiAgentSuccessRate,
    measures: ['successRate', 'aiAgentTicketVolume'],
    dimensions: [
        'aiAgentRole',
        'aiIntentCustomField',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
        'resourceSourceId',
        'resourceSourceSetId',
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
        'resourceSourceId',
        'resourceSourceSetId',
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

export const aiAgentShoppingAssistantSuccessRateTrend = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_SUCCESS_RATE)
    .defineQuery(({ ctx, config }) => ({
        measures: ['successRate'] as const,
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'aiAgentRole',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationSkillType.AiAgentSales],
            },
        ] as any,
    }))

export const aiAgentShoppingAssistantSuccessRateTrendQueryFactory = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentShoppingAssistantSuccessRateTrend.build(ctx)

export const aiSupportAgentSuccessRatePerIntent = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_SUCCESS_RATE_PER_INTENT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['successRate'] as const,
        dimensions: ['aiIntentCustomField'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'aiAgentRole',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationSkillType.AiAgentSupport],
            },
        ] as any,
    }))

export const aiSupportAgentSuccessRatePerIntentQueryFactoryV2 = (
    ctx: AiAgentSuccessRateContext,
) => aiSupportAgentSuccessRatePerIntent.build(ctx)

/**
 * Per-skill success rate. Skill identity is the pair
 * (resourceSourceSetId, resourceSourceId) carried in ctx.filters and resolved
 * by the backend through the TicketInsightsSkillParticipation helper cube.
 * Single-measure by design — joining additional measures through the helper
 * intersects the result to tickets present in every joined cube.
 */
export const aiAgentSuccessRateBySkill = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUCCESS_RATE_BY_SKILL)
    .defineQuery(() => ({
        measures: ['successRate'] as const,
    }))

export const aiAgentSuccessRateBySkillQueryFactory = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentSuccessRateBySkill.build(ctx)

/**
 * Per-skill AI Agent ticket volume. Backed by `SuccessRate.aiAgentTicketVolume`
 * — the count of AI Agent tickets attributed to the skill.
 */
export const aiAgentTicketVolumeBySkill = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_TICKET_VOLUME_BY_SKILL)
    .defineQuery(() => ({
        measures: ['aiAgentTicketVolume'] as const,
    }))

export const aiAgentTicketVolumeBySkillQueryFactory = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentTicketVolumeBySkill.build(ctx)

/**
 * AI Agent ticket volume grouped by skill identity. Returns one row per
 * (resourceSourceSetId, resourceSourceId) pair joined through the
 * TicketInsightsSkillParticipation helper cube. Powers the Skills page table,
 * which needs the count per row in a single query (calling
 * `aiAgentTicketVolumeBySkill` once per skill would be N requests).
 */
export const aiAgentTicketVolumePerSkill = aiAgentSuccessRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_TICKET_VOLUME_PER_SKILL)
    .defineQuery(() => ({
        measures: ['aiAgentTicketVolume'] as const,
        dimensions: ['resourceSourceSetId', 'resourceSourceId'] as const,
    }))

export const aiAgentTicketVolumePerSkillQueryFactory = (
    ctx: AiAgentSuccessRateContext,
) => aiAgentTicketVolumePerSkill.build(ctx)

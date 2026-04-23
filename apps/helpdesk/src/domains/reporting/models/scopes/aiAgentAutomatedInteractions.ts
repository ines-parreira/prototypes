import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationSkillType } from 'domains/reporting/models/scopes//constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentAutomatedInteractionsScope = defineScope({
    scope: MetricScope.AiAgentAutomatedInteractions,
    measures: ['automatedInteractionsCount'],
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
        'customField',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['automatedInteractionsCount', 'eventDatetime', 'ticketId'],
})

export type AiAgentAutomatedInteractionsContext = Context<
    typeof aiAgentAutomatedInteractionsScope.config
>

export const aiAgentAutomatedInteractionsPerChannel =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_PER_CHANNEL,
        )
        .defineQuery(() => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['channel'],
        }))

export const aiAgentAutomatedInteractionsPerChannelQueryFactoryV2 = (
    ctx: Context,
) => aiAgentAutomatedInteractionsPerChannel.build(ctx)

export const aiAgentAutomatedInteractionsPerIntent =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_PER_INTENT,
        )
        .defineQuery(() => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['aiIntentCustomField'],
        }))

export const aiAgentAutomatedInteractionsPerIntentQueryFactoryV2 = (
    ctx: AiAgentAutomatedInteractionsContext,
) => aiAgentAutomatedInteractionsPerIntent.build(ctx)

export const dynamicShoppingAssistantAutomatedInteractions =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'],
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    aiAgentRole: withLogicalOperator([
                        AutomationSkillType.AiAgentSales,
                    ]),
                },
                config,
            ),
            dimensions: ctx.dimensions,
        }))

export const dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2 = (
    ctx: AiAgentAutomatedInteractionsContext,
) => dynamicShoppingAssistantAutomatedInteractions.build(ctx)

export const aiSalesAgentAutomatedInteractionsPerChannel =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['channel'],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSales],
                },
            ] as any,
        }))

export const aiSalesAgentAutomatedInteractionsPerChannelQueryFactoryV2 = (
    ctx: Context,
) => aiSalesAgentAutomatedInteractionsPerChannel.build(ctx)

export const aiSalesAgentAutomatedInteractionsPerEngagementType =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_AUTOMATED_INTERACTIONS_PER_ENGAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['engagementType'],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSales],
                },
            ] as any,
        }))

export const aiSalesAgentAutomatedInteractionsPerEngagementTypeQueryFactoryV2 =
    (ctx: Context) =>
        aiSalesAgentAutomatedInteractionsPerEngagementType.build(ctx)

export const aiSupportAgentAutomatedInteractionsPerChannel =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SUPPORT_AUTOMATED_INTERACTIONS_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['channel'],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSupport],
                },
            ] as any,
        }))

export const aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2 = (
    ctx: Context,
) => aiSupportAgentAutomatedInteractionsPerChannel.build(ctx)

export const aiSupportAgentAutomatedInteractionsPerIntent =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SUPPORT_AUTOMATED_INTERACTIONS_PER_INTENT,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'] as const,
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

export const aiSupportAgentAutomatedInteractionsPerIntentQueryFactoryV2 = (
    ctx: Context,
) => aiSupportAgentAutomatedInteractionsPerIntent.build(ctx)

export const dynamicAiShoppingAgentAutomatedInteractionsTimeseries =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_TIMESERIES,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'],
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    aiAgentRole: withLogicalOperator([
                        AutomationSkillType.AiAgentSales,
                    ]),
                },
                config,
            ),
            time_dimensions: [
                {
                    dimension: 'eventDatetime',
                    granularity: ctx.granularity,
                },
            ],
            dimensions: ctx.dimensions,
            limit: 10000,
        }))

export const dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2 =
    (ctx: Context) =>
        dynamicAiShoppingAgentAutomatedInteractionsTimeseries.build(ctx)

export const dynamicAllAgentsAutomatedInteractions =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx }) => ({
            measures: ['automatedInteractionsCount'],
            dimensions: ctx.dimensions,
        }))

export const dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 = (
    ctx: Context,
) => dynamicAllAgentsAutomatedInteractions.build(ctx)

export const dynamicAllAgentsAutomatedInteractionsTimeseries =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS_TIMESERIES,
        )
        .defineQuery(({ ctx }) => ({
            measures: ['automatedInteractionsCount'],
            time_dimensions: [
                {
                    dimension: 'eventDatetime',
                    granularity: ctx.granularity,
                },
            ],
            dimensions: ctx.dimensions,
            limit: 10000,
        }))

export const dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicAllAgentsAutomatedInteractionsTimeseries.build(ctx)

export const dynamicSupportAgentAutomatedInteractions =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'],
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    aiAgentRole: withLogicalOperator([
                        AutomationSkillType.AiAgentSupport,
                    ]),
                },
                config,
            ),
            dimensions: ctx.dimensions,
            limit: 10000,
        }))

export const dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 = (
    ctx: Context,
) => dynamicSupportAgentAutomatedInteractions.build(ctx)

export const dynamicSupportAgentAutomatedInteractionsTimeseries =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'],
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    aiAgentRole: withLogicalOperator([
                        AutomationSkillType.AiAgentSupport,
                    ]),
                },
                config,
            ),
            time_dimensions: [
                {
                    dimension: 'eventDatetime',
                    granularity: ctx.granularity,
                },
            ],
            dimensions: ctx.dimensions,
            limit: 10000,
        }))

export const dynamicSupportAgentAutomatedInteractionsTimeseriesQueryFactoryV2 =
    (ctx: Context) =>
        dynamicSupportAgentAutomatedInteractionsTimeseries.build(ctx)

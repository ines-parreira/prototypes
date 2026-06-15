import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    AutomationFeatureType,
    AutomationSkillType,
} from 'domains/reporting/models/scopes/constants'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type { Context } from 'domains/reporting/models/scopes/scope'
import {
    createScopeFilters,
    getBreakdownQuery,
} from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const handoverInteractionsScope = defineScope({
    scope: MetricScope.HandoverInteractions,
    measures: ['handoverInteractionsCount'],
    dimensions: [
        'aiAgentRole',
        'aiIntentCustomField',
        'automationFeatureType',
        'channel',
        'customField',
        'engagementType',
        'flowId',
        'storeIntegrationId',
        'orderManagementType',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'automationFeatureType',
        'channel',
        'customField',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['eventDatetime', 'handoverInteractionsCount'],
})

export type HandoverInteractionsContext = Context<
    typeof handoverInteractionsScope.config
>

export const handoverInteractions = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.HANDOVER_INTERACTIONS)
    .defineQuery(() => ({
        measures: ['handoverInteractionsCount'],
    }))

export const handoverInteractionsV2QueryFactory = (
    ctx: HandoverInteractionsContext,
) => handoverInteractions.build(ctx)

export const handoverInteractionsPerFeature = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.HANDOVER_INTERACTIONS_PER_FEATURE)
    .defineQuery(() => ({
        measures: ['handoverInteractionsCount'],
        dimensions: ['automationFeatureType'],
    }))

export const handoverInteractionsPerFeatureQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => handoverInteractionsPerFeature.build(ctx)

export const handoverInteractionsPerOrderManagementType =
    handoverInteractionsScope
        .defineMetricName(
            METRIC_NAMES.HANDOVER_INTERACTIONS_PER_ORDER_MANAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['handoverInteractionsCount'],
            dimensions: ['orderManagementType'],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'automationFeatureType',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationFeatureType.OrderManagement],
                },
            ] as any,
        }))

export const handoverInteractionsPerOrderManagementTypeQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => handoverInteractionsPerOrderManagementType.build(ctx)

export const {
    breakdownQuery: dynamicHandoverInteractions,
    breakdownQueryFactory: dynamicHandoverInteractionsQueryFactoryV2,
} = getBreakdownQuery(
    handoverInteractionsScope,
    () => ({ measures: ['handoverInteractionsCount'] as const }),
    METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_BREAKDOWN_PER_STORE,
)

export const aiAgentHandoverInteractions = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'automationFeatureType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationFeatureType.AiAgent],
            },
        ] as any,
    }))

export const aiAgentHandoverInteractionsV2QueryFactory = (
    ctx: HandoverInteractionsContext,
) => aiAgentHandoverInteractions.build(ctx)

export const aiSalesAgentHandoverInteractions = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SALES_HANDOVER_INTERACTIONS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'aiAgentRole',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationSkillType.AiAgentSales],
            },
        ] as any,
    }))

export const aiSalesAgentHandoverInteractionsV2QueryFactory = (
    ctx: HandoverInteractionsContext,
) => aiSalesAgentHandoverInteractions.build(ctx)

export const aiSupportHandoverInteractions = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_HANDOVER_INTERACTIONS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'aiAgentRole',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationSkillType.AiAgentSupport],
            },
        ] as any,
    }))

export const aiSupportHandoverInteractionsV2QueryFactory = (
    ctx: HandoverInteractionsContext,
) => aiSupportHandoverInteractions.build(ctx)

export const handoverInteractionsPerChannel = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_CHANNEL)
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
        dimensions: ['channel'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'automationFeatureType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationFeatureType.AiAgent],
            },
        ] as any,
    }))

export const handoverInteractionsPerChannelQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => handoverInteractionsPerChannel.build(ctx)

export const aiAgentHandoverInteractionsPerIntent = handoverInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_INTENT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
        dimensions: ['aiIntentCustomField'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'automationFeatureType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationFeatureType.AiAgent],
            },
        ] as any,
    }))

export const aiSupportHandoverInteractionsPerChannel = handoverInteractionsScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SUPPORT_HANDOVER_INTERACTIONS_PER_CHANNEL,
    )
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
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

export const aiAgentHandoverInteractionsPerIntentQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => aiAgentHandoverInteractionsPerIntent.build(ctx)

export const aiSupportHandoverInteractionsPerChannelQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => aiSupportHandoverInteractionsPerChannel.build(ctx)

export const aiSupportHandoverInteractionsPerIntent = handoverInteractionsScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SUPPORT_HANDOVER_INTERACTIONS_PER_INTENT,
    )
    .defineQuery(({ ctx, config }) => ({
        measures: ['handoverInteractionsCount'],
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

export const aiSupportHandoverInteractionsPerIntentQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => aiSupportHandoverInteractionsPerIntent.build(ctx)

export const aiSalesAgentHandoverInteractionsPerChannel =
    handoverInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['handoverInteractionsCount'],
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

export const aiSalesAgentHandoverInteractionsPerChannelQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => aiSalesAgentHandoverInteractionsPerChannel.build(ctx)

export const aiSalesAgentHandoverInteractionsPerEngagementType =
    handoverInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_HANDOVER_INTERACTIONS_PER_ENGAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['handoverInteractionsCount'],
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

export const aiSalesAgentHandoverInteractionsPerEngagementTypeQueryFactoryV2 = (
    ctx: HandoverInteractionsContext,
) => aiSalesAgentHandoverInteractionsPerEngagementType.build(ctx)

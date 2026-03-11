import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const handoverInteractionsScope = defineScope({
    scope: MetricScope.HandoverInteractions,
    measures: ['handoverInteractionsCount'],
    dimensions: [
        'aiAgentSkill',
        'automationFeatureType',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
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
                member: 'aiAgentSkill',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationFeatureType.AiAgentSales],
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
                member: 'aiAgentSkill',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationFeatureType.AiAgentSupport],
            },
        ] as any,
    }))

export const aiSupportHandoverInteractionsV2QueryFactory = (
    ctx: HandoverInteractionsContext,
) => aiSupportHandoverInteractions.build(ctx)

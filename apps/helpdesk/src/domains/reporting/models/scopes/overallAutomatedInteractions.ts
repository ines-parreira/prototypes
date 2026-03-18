import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const overallAutomatedInteractionsScope = defineScope({
    scope: MetricScope.OverallAutomatedInteractions,
    measures: ['automatedInteractionsCount'],
    dimensions: [
        'automationFeatureType',
        'flowId',
        'orderManagementType',
        'channel',
        'storeIntegrationId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'channel',
        'storeIntegrationId',
        'automationFeatureType',
    ],
    order: ['eventDatetime', 'automatedInteractionsCount'],
})

export const dynamicOverallAutomatedInteractions =
    overallAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx }) => ({
            measures: ['automatedInteractionsCount'],
            dimensions: ctx.dimensions,
        }))

export const dynamicOverallAutomatedInteractionsQueryFactoryV2 = (
    ctx: Context,
) => dynamicOverallAutomatedInteractions.build(ctx)

export const automatedInteractionsPerOrderManagementType =
    overallAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AUTOMATED_INTERACTIONS_PER_ORDER_MANAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'] as const,
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

export const automatedInteractionsPerOrderManagementTypeQueryFactoryV2 = (
    ctx: Context,
) => automatedInteractionsPerOrderManagementType.build(ctx)

export const dynamicOverallAutomatedInteractionsTimeseries =
    overallAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS_TIMESERIES,
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
        }))

export const dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicOverallAutomatedInteractionsTimeseries.build(ctx)

export const automatedInteractionsPerFlows = overallAutomatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AUTOMATED_INTERACTIONS_PER_FLOWS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['automatedInteractionsCount'] as const,
        dimensions: ['flowId'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'automationFeatureType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomationFeatureType.Flows],
            },
        ] as any,
    }))

export const automatedInteractionsPerFlowsQueryFactoryV2 = (ctx: Context) =>
    automatedInteractionsPerFlows.build(ctx)

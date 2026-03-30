import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const overallAutomationRateScope = defineScope({
    scope: MetricScope.OverallAutomationRate,
    measures: ['automationRate'],
    dimensions: [
        'aiAgentRole',
        'automationFeatureType',
        'channel',
        'flowId',
        'orderManagementType',
        'storeIntegrationId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'automationFeatureType',
        'channel',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['eventDatetime'],
})

export const overallAutomationRate = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_OVERALL_AUTOMATION_RATE)
    .defineQuery(() => ({
        measures: ['automationRate'],
    }))

export const overallAutomationRateQueryFactoryV2 = (ctx: Context) =>
    overallAutomationRate.build(ctx)

export const aiAgentAutomationRate = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATION_RATE)
    .defineQuery(({ ctx, config }) => ({
        measures: ['automationRate'],
        filters: createScopeFilters(
            {
                ...ctx.filters,
                automationFeatureType: withLogicalOperator([
                    AutomationFeatureType.AiAgent,
                ]),
            },
            config,
        ),
    }))

export const aiAgentAutomationRateQueryFactoryV2 = (ctx: Context) =>
    aiAgentAutomationRate.build(ctx)

export const automationRatePerFeature = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATION_RATE_PER_FEATURE)
    .defineQuery(() => ({
        measures: ['automationRate'],
        dimensions: ['automationFeatureType'],
    }))

export const automationRatePerFeatureQueryFactoryV2 = (ctx: Context) =>
    automationRatePerFeature.build(ctx)

export const dynamicOverallAutomationRate = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATION_RATE)
    .defineQuery(({ ctx }) => ({
        measures: ['automationRate'],
        dimensions: ctx.dimensions,
    }))

export const dynamicOverallAutomationRateQueryFactoryV2 = (ctx: Context) =>
    dynamicOverallAutomationRate.build(ctx)

export const dynamicAllAgentsAutomationRate = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATION_RATE)
    .defineQuery(({ ctx, config }) => ({
        measures: ['automationRate'],
        filters: createScopeFilters(
            {
                ...ctx.filters,
                automationFeatureType: withLogicalOperator([
                    AutomationFeatureType.AiAgent,
                ]),
            },
            config,
        ),
        dimensions: ctx.dimensions,
    }))

export const dynamicAllAgentsAutomationRateQueryFactoryV2 = (ctx: Context) =>
    dynamicAllAgentsAutomationRate.build(ctx)

export const overallAutomationRatePerOrderManagementType =
    overallAutomationRateScope
        .defineMetricName(
            METRIC_NAMES.OVERALL_AUTOMATION_RATE_PER_ORDER_MANAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automationRate'] as const,
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

export const overallAutomationRatePerOrderManagementTypeQueryFactoryV2 = (
    ctx: Context,
) => overallAutomationRatePerOrderManagementType.build(ctx)

export const dynamicOverallAutomationRateTimeseries = overallAutomationRateScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATION_RATE_TIMESERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['automationRate'],
        time_dimensions: [
            {
                dimension: 'eventDatetime',
                granularity: ctx.granularity,
            },
        ],
        dimensions: ctx.dimensions,
    }))

export const dynamicOverallAutomationRateTimeseriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicOverallAutomationRateTimeseries.build(ctx)

export const overallAutomationRatePerFlows = overallAutomationRateScope
    .defineMetricName(METRIC_NAMES.OVERALL_AUTOMATION_RATE_PER_FLOWS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['automationRate'] as const,
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

export const overallAutomationRatePerFlowsQueryFactoryV2 = (ctx: Context) =>
    overallAutomationRatePerFlows.build(ctx)

export const dynamicAllAgentsAutomationRateTimeseries =
    overallAutomationRateScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATION_RATE_TIMESERIES,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automationRate'],
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    automationFeatureType: withLogicalOperator([
                        AutomationFeatureType.AiAgent,
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
        }))

export const dynamicAllAgentsAutomationRateTimeseriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicAllAgentsAutomationRateTimeseries.build(ctx)

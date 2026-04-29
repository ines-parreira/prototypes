import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const overallTimeSavedByAgentScope = defineScope({
    scope: MetricScope.OverallTimeSavedByAgent,
    measures: ['averageTimeSavedByAgent', 'medianTimeSavedByAgent'],
    dimensions: [
        'automationFeatureType',
        'channel',
        'flowId',
        'orderManagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'automationFeatureType',
        'channel',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'averageTimeSavedByAgent',
        'eventDatetime',
        'medianTimeSavedByAgent',
        'ticketId',
    ],
})

export type OverallTimeSavedByAgentContext = Context<
    typeof overallTimeSavedByAgentScope.config
>

export const overallTimeSavedByAgentForOrderManagement =
    overallTimeSavedByAgentScope
        .defineMetricName(
            METRIC_NAMES.OVERALL_TIME_SAVED_BY_AGENT_PER_ORDER_MANAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['averageTimeSavedByAgent'] as const,
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

export const overallTimeSavedByAgentForOrderManagementQueryFactoryV2 = (
    ctx: OverallTimeSavedByAgentContext,
) => overallTimeSavedByAgentForOrderManagement.build(ctx)

export const overallTimeSavedByAgentPerFlows = overallTimeSavedByAgentScope
    .defineMetricName(METRIC_NAMES.OVERALL_TIME_SAVED_BY_AGENT_PER_FLOWS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['averageTimeSavedByAgent'] as const,
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

export const overallTimeSavedByAgentPerFlowsQueryFactoryV2 = (ctx: Context) =>
    overallTimeSavedByAgentPerFlows.build(ctx)

export const overallTimeSavedByAgentPerFeature = overallTimeSavedByAgentScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_OVERVIEW_OVERALL_TIME_SAVED_BY_AGENT_PER_FEATURE,
    )
    .defineQuery(() => ({
        measures: ['averageTimeSavedByAgent'] as const,
        dimensions: ['automationFeatureType'],
    }))

export const overallTimeSavedByAgentPerFeatureQueryFactoryV2 = (
    ctx: OverallTimeSavedByAgentContext,
) => overallTimeSavedByAgentPerFeature.build(ctx)

export const dynamicAverageTimeSavedByAgent = overallTimeSavedByAgentScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_AVERAGE_TIME_SAVED_BY_AGENT)
    .defineQuery(({ ctx }) => ({
        measures: ['averageTimeSavedByAgent'],
        dimensions: ctx.dimensions,
    }))

export const dynamicAverageTimeSavedByAgentQueryFactoryV2 = (ctx: Context) =>
    dynamicAverageTimeSavedByAgent.build(ctx)

export const dynamicAverageTimeSavedByAgentTimeseries =
    overallTimeSavedByAgentScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_AVERAGE_TIME_SAVED_BY_AGENT_TIMESERIES,
        )
        .defineQuery(({ ctx }) => ({
            measures: ['averageTimeSavedByAgent'],
            time_dimensions: [
                {
                    dimension: 'eventDatetime',
                    granularity: ctx.granularity,
                },
            ],
            dimensions: ctx.dimensions,
        }))

export const dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicAverageTimeSavedByAgentTimeseries.build(ctx)

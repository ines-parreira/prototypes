import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import {
    createScopeFilters,
    getBreakdownQuery,
} from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentDecreaseInFirstResponseTimeScope = defineScope({
    scope: MetricScope.AiAgentDecreaseInFirstResponseTime,
    measures: [
        'averageDecreaseInFirstResponseTime',
        'medianDecreaseInFirstResponseTime',
    ],
    dimensions: [
        'aiAgentRole',
        'aiIntentCustomField',
        'channel',
        'customField',
        'engagementType',
        'firstResponseTime',
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
    order: [
        'averageDecreaseInFirstResponseTime',
        'eventDatetime',
        'firstResponseTime',
        'medianDecreaseInFirstResponseTime',
        'ticketId',
    ],
})

export type AiAgentDecreaseInFirstResponseTimeContext = Context<
    typeof aiAgentDecreaseInFirstResponseTimeScope.config
>

export const aiAgentSupportAgentDecreaseInFRTPerChannel =
    aiAgentDecreaseInFirstResponseTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_DECREASE_IN_FRT_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
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

export const aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2 = (
    ctx: AiAgentDecreaseInFirstResponseTimeContext,
) => aiAgentSupportAgentDecreaseInFRTPerChannel.build(ctx)

export const aiAgentSupportAgentDecreaseInFRT =
    aiAgentDecreaseInFirstResponseTimeScope
        .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_DECREASE_IN_FRT)
        .defineQuery(({ ctx, config }) => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSupport],
                },
            ] as any,
        }))

export const aiAgentSupportAgentDecreaseInFRTQueryV2Factory = (
    ctx: AiAgentDecreaseInFirstResponseTimeContext,
) => aiAgentSupportAgentDecreaseInFRT.build(ctx)

export const aiAgentSupportAgentDecreaseInFRTPerIntent =
    aiAgentDecreaseInFirstResponseTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_DECREASE_IN_FRT_PER_INTENT,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
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

export const aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2 = (
    ctx: AiAgentDecreaseInFirstResponseTimeContext,
) => aiAgentSupportAgentDecreaseInFRTPerIntent.build(ctx)

export const dynamicSupportAgentDecreaseInFRT =
    aiAgentDecreaseInFirstResponseTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_DECREASE_IN_FRT,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['medianDecreaseInFirstResponseTime'],
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
        }))

export const dynamicSupportAgentDecreaseInFRTQueryFactoryV2 = (ctx: Context) =>
    dynamicSupportAgentDecreaseInFRT.build(ctx)

export const dynamicSupportAgentDecreaseInFRTTimeseries =
    aiAgentDecreaseInFirstResponseTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_DECREASE_IN_FRT_TIMESERIES,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['medianDecreaseInFirstResponseTime'],
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

export const dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicSupportAgentDecreaseInFRTTimeseries.build(ctx)

export const aiAgentAllAgentsDecreaseInFRT =
    aiAgentDecreaseInFirstResponseTimeScope
        .defineMetricName(METRIC_NAMES.AI_AGENT_ALL_AGENTS_DECREASE_IN_FRT)
        .defineQuery(() => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
        }))

export const aiAgentAllAgentsDecreaseInFRTQueryV2Factory = (
    ctx: AiAgentDecreaseInFirstResponseTimeContext,
) => aiAgentAllAgentsDecreaseInFRT.build(ctx)

export const {
    breakdownQuery: dynamicAiAgentDecreaseInFRT,
    breakdownQueryFactory: dynamicAiAgentDecreaseInFRTQueryFactoryV2,
} = getBreakdownQuery(
    aiAgentDecreaseInFirstResponseTimeScope,
    () => ({ measures: ['medianDecreaseInFirstResponseTime'] as const }),
    METRIC_NAMES.AI_AGENT_DECREASE_IN_FRT_BREAKDOWN_PER_STORE,
)

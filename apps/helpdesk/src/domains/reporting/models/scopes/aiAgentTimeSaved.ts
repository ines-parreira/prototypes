import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentTimeSavedScope = defineScope({
    scope: MetricScope.AiAgentTimeSaved,
    measures: ['averageTimeSavedByAgent', 'medianTimeSavedByAgent'],
    dimensions: [
        'aiAgentRole',
        'aiIntentCustomField',
        'channel',
        'customField',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'channel',
        'customField',
        'customFieldId',
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

export type AiAgentTimeSavedContext = Context<
    typeof aiAgentTimeSavedScope.config
>

export const overallTimeSavedByAgentPerChannel = aiAgentTimeSavedScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_TIME_SAVED_PER_CHANNEL,
    )
    .defineQuery(({ ctx, config }) => ({
        measures: ['medianTimeSavedByAgent'] as const,
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

export const overallTimeSavedByAgentPerChannelQueryFactoryV2 = (
    ctx: AiAgentTimeSavedContext,
) => overallTimeSavedByAgentPerChannel.build(ctx)

export const aiAgentSupportAgentTimeSavedPerIntent = aiAgentTimeSavedScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_TIME_SAVED_PER_INTENT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['medianTimeSavedByAgent'] as const,
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

export const aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2 = (
    ctx: AiAgentTimeSavedContext,
) => aiAgentSupportAgentTimeSavedPerIntent.build(ctx)

export const dynamicAllAgentsTimeSaved = aiAgentTimeSavedScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_TIME_SAVED_BY_AGENT,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['medianTimeSavedByAgent'],
        dimensions: ctx.dimensions,
    }))

export const dynamicAllAgentsTimeSavedQueryFactoryV2 = (ctx: Context) =>
    dynamicAllAgentsTimeSaved.build(ctx)

export const dynamicAllAgentsTimeSavedTimeseries = aiAgentTimeSavedScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_TIME_SAVED_BY_AGENT_TIMESERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['medianTimeSavedByAgent'],
        time_dimensions: [
            {
                dimension: 'eventDatetime',
                granularity: ctx.granularity,
            },
        ],
        dimensions: ctx.dimensions,
    }))

export const dynamicAllAgentsTimeSavedTimeSeriesQueryFactoryV2 = (
    ctx: Context,
) => dynamicAllAgentsTimeSavedTimeseries.build(ctx)

export const dynamicSupportAgentTimeSaved = aiAgentTimeSavedScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_TIME_SAVED)
    .defineQuery(({ ctx, config }) => ({
        measures: ['medianTimeSavedByAgent'],
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

export const dynamicSupportAgentTimeSavedQueryFactoryV2 = (ctx: Context) =>
    dynamicSupportAgentTimeSaved.build(ctx)

export const medianTimeSavedSupportAgentTimeseries = aiAgentTimeSavedScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_TIME_SAVED_TIMESERIES)
    .defineQuery(({ ctx, config }) => ({
        measures: ['medianTimeSavedByAgent'] as const,
        time_dimensions: [
            { dimension: 'eventDatetime', granularity: ctx.granularity },
        ] as const,
        filters: createScopeFilters(
            {
                ...ctx.filters,
                aiAgentRole: withLogicalOperator([
                    AutomationSkillType.AiAgentSupport,
                ]),
            },
            config,
        ),
    }))

export const medianTimeSavedSupportAgentTimeseriesQueryV2Factory = (
    ctx: Context,
) => medianTimeSavedSupportAgentTimeseries.build(ctx)

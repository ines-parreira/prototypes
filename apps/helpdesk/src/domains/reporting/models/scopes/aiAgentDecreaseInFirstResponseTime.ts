import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentDecreaseInFirstResponseTimeScope = defineScope({
    scope: MetricScope.AiAgentDecreaseInFirstResponseTime,
    measures: [
        'averageDecreaseInFirstResponseTime',
        'medianDecreaseInFirstResponseTime',
    ],
    dimensions: [
        'aiAgentRole',
        'aiAgentSkill',
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
        'aiAgentSkill',
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
            measures: ['averageDecreaseInFirstResponseTime'] as const,
            dimensions: ['channel'],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentSkill',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSupport],
                },
            ] as any,
        }))

export const aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2 = (
    ctx: AiAgentDecreaseInFirstResponseTimeContext,
) => aiAgentSupportAgentDecreaseInFRTPerChannel.build(ctx)

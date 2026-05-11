import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentDecreaseInResolutionTimeScope = defineScope({
    scope: MetricScope.AiAgentDecreaseInResolutionTime,
    measures: [
        'averageDecreaseInResolutionTime',
        'medianDecreaseInResolutionTime',
    ],
    dimensions: [
        'aiAgentRole',
        'channel',
        'customField',
        'resolutionTime',
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
        'averageDecreaseInResolutionTime',
        'eventDatetime',
        'medianDecreaseInResolutionTime',
        'ticketId',
    ],
})

export type AiAgentDecreaseInResolutionTimeContext = Context<
    typeof aiAgentDecreaseInResolutionTimeScope.config
>

export const aiAgentSupportAgentDecreaseInResolutionTime =
    aiAgentDecreaseInResolutionTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_DECREASE_IN_RESOLUTION_TIME,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['medianDecreaseInResolutionTime'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentRole',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSupport],
                },
            ] as any,
        }))

export const aiAgentSupportAgentDecreaseInResolutionTimeQueryV2Factory = (
    ctx: AiAgentDecreaseInResolutionTimeContext,
) => aiAgentSupportAgentDecreaseInResolutionTime.build(ctx)

export const aiAgentAllAgentsDecreaseInResolutionTime =
    aiAgentDecreaseInResolutionTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_ALL_AGENTS_DECREASE_IN_RESOLUTION_TIME,
        )
        .defineQuery(() => ({
            measures: ['medianDecreaseInResolutionTime'] as const,
        }))

export const aiAgentAllAgentsDecreaseInResolutionTimeQueryV2Factory = (
    ctx: AiAgentDecreaseInResolutionTimeContext,
) => aiAgentAllAgentsDecreaseInResolutionTime.build(ctx)

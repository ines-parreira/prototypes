import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiAgentTimeSavedScope = defineScope({
    scope: MetricScope.AiAgentTimeSaved,
    measures: ['averageTimeSavedByAgent', 'medianTimeSavedByAgent'],
    dimensions: [
        'aiAgentSkill',
        'channel',
        'customField',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
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
        measures: ['averageTimeSavedByAgent'] as const,
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

export const overallTimeSavedByAgentPerChannelQueryFactoryV2 = (
    ctx: AiAgentTimeSavedContext,
) => overallTimeSavedByAgentPerChannel.build(ctx)

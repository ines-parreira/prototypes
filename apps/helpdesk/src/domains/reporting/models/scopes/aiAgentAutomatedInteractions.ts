import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationSkillType } from 'domains/reporting/models/scopes//constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

export const aiAgentAutomatedInteractionsScope = defineScope({
    scope: MetricScope.AiAgentAutomatedInteractions,
    measures: ['automatedInteractionsCount'],
    dimensions: [
        'aiAgentSkill',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'channel',
        'customField',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['automatedInteractionsCount', 'eventDatetime', 'ticketId'],
})

export type AiAgentAutomatedInteractionsContext = Context<
    typeof aiAgentAutomatedInteractionsScope.config
>

export const aiAgentAutomatedInteractionsPerChannel =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_PER_CHANNEL,
        )
        .defineQuery(() => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['channel'],
        }))

export const aiAgentAutomatedInteractionsPerChannelQueryFactoryV2 = (
    ctx: Context,
) => aiAgentAutomatedInteractionsPerChannel.build(ctx)

export const aiAgentAutomatedInteractionsPerIntent =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_PER_INTENT,
        )
        .defineQuery(() => ({
            measures: ['automatedInteractionsCount'] as const,
            dimensions: ['customField'],
        }))

export const aiAgentAutomatedInteractionsPerIntentQueryFactoryV2 = (
    ctx: AiAgentAutomatedInteractionsContext,
) => aiAgentAutomatedInteractionsPerIntent.build(ctx)

export const dynamicShoppingAssistantAutomatedInteractions =
    aiAgentAutomatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractionsCount'],
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    aiAgentSkill: withLogicalOperator([
                        AutomationSkillType.AiAgentSales,
                    ]),
                },
                config,
            ),
            dimensions: ctx.dimensions,
        }))

export const dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2 = (
    ctx: AiAgentAutomatedInteractionsContext,
) => dynamicShoppingAssistantAutomatedInteractions.build(ctx)

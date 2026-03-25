import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

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

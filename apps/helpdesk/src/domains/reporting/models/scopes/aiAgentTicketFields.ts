import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { MetricName } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const aiAgentTicketFieldsScope = defineScope({
    scope: MetricScope.AiAgentTicketFields,
    measures: ['ticketCount'],
    dimensions: ['aiOutcomeCustomField', 'aiAgentRole'],
    timeDimensions: ['updatedDatetime'],
    order: ['ticketCount', 'aiOutcomeCustomField', 'aiAgentRole'],
    filters: [
        'aiAgentRole',
        'channel',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
})

export type AiAgentTicketFieldsMetricContext = Context<
    typeof aiAgentTicketFieldsScope.config
>

export const aiAgentDynamicOutcomeBreakdown = aiAgentTicketFieldsScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_INTENT_BREAKDOWN_PER_ROLE_AND_OUTCOME,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        dimensions: ctx.dimensions,
        limit: 10_000,
    }))

export const dynamicAiAgentOutcomeBreakdownQueryFactoryV2 = (
    ctx: Context,
    metricName: MetricName,
) => ({ ...aiAgentDynamicOutcomeBreakdown.build(ctx), metricName })

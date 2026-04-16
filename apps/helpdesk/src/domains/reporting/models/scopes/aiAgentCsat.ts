import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

export const aiAgentCsatScope = defineScope({
    scope: MetricScope.AiAgentCsat,
    measures: ['averageCSAT', 'medianCSAT'],
    dimensions: [
        'aiAgentRole',
        'channel',
        'engagementType',
        'storeIntegrationId',
        'surveyScore',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'averageCSAT',
        'eventDatetime',
        'medianCSAT',
        'surveyScore',
        'ticketId',
    ],
})

export type AiAgentCsatContext = Context<typeof aiAgentCsatScope.config>

export const averageAiAgentCsat = aiAgentCsatScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE)
    .defineQuery(() => ({
        measures: ['averageCSAT'] as const,
    }))

export const averageAiAgentCsatQueryV2Factory = (ctx: AiAgentCsatContext) =>
    averageAiAgentCsat.build(ctx)

export const averageAiAgentCsatSupportAgent = aiAgentCsatScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AVERAGE_CSAT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['averageCSAT'] as const,
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

export const averageAiAgentCsatSupportAgentQueryV2Factory = (
    ctx: AiAgentCsatContext,
) => averageAiAgentCsatSupportAgent.build(ctx)

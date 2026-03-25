import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentCoverageRateScope = defineScope({
    scope: MetricScope.AiAgentCoverageRate,
    measures: ['coverageRate'],
    dimensions: ['aiAgentSkill', 'channel', 'customField', 'ticketId'],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'channel',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['coverageRate', 'eventDatetime', 'ticketId'],
})

export type AiAgentCoverageRateContext = Context<
    typeof aiAgentCoverageRateScope.config
>

export const coverageRate = aiAgentCoverageRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_ALL_AGENTS_COVERAGE_RATE)
    .defineQuery(() => ({
        measures: ['coverageRate'] as const,
    }))

export const coverageRateQueryV2Factory = (ctx: AiAgentCoverageRateContext) =>
    coverageRate.build(ctx)

export const aiAgentCoverageRatePerChannel = aiAgentCoverageRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_COVERAGE_RATE_PER_CHANNEL)
    .defineQuery(() => ({
        measures: ['coverageRate'] as const,
        dimensions: ['channel'],
    }))

export const aiAgentCoverageRatePerChannelQueryFactoryV2 = (
    ctx: AiAgentCoverageRateContext,
) => aiAgentCoverageRatePerChannel.build(ctx)

export const aiAgentAutomationRatePerIntent = aiAgentCoverageRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_OVERALL_AUTOMATION_RATE_PER_INTENT)
    .defineQuery(() => ({
        measures: ['coverageRate'] as const,
        dimensions: ['customField'],
    }))

export const aiAgentAutomationRatePerIntentQueryFactoryV2 = (
    ctx: AiAgentCoverageRateContext,
) => aiAgentAutomationRatePerIntent.build(ctx)

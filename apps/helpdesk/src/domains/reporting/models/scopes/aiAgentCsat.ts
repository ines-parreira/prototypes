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
        'resourceSourceId',
        'resourceSourceSetId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
        'resourceSourceId',
        'resourceSourceSetId',
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

/**
 * Per-skill average CSAT. Skill identity is the pair
 * (resourceSourceSetId, resourceSourceId) carried in ctx.filters and resolved
 * by the backend through the TicketInsightsSkillParticipation helper cube.
 *
 * Single-measure by design — combining CSAT with handover/volume measures in
 * one query through the helper drops handover tickets from every metric.
 *
 * The AIAgentCSAT cube applies `HAVING last_outcome != 'handover'` based on
 * the account's outcome custom-field id; the monolith's AiAgentCsatQuery
 * `_customize_query` looks that id up from the account context and injects
 * the `AIAgentCSAT.aiAgentOutcomeCustomFieldId` cube filter automatically,
 * so we don't pass it from the frontend.
 */
export const averageAiAgentCsatBySkill = aiAgentCsatScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_CSAT_BY_SKILL)
    .defineQuery(() => ({
        measures: ['averageCSAT'] as const,
    }))

export const averageAiAgentCsatBySkillQueryFactory = (
    ctx: AiAgentCsatContext,
) => averageAiAgentCsatBySkill.build(ctx)

/**
 * Average CSAT grouped by skill identity. Returns one row per
 * (resourceSourceSetId, resourceSourceId) pair joined through the
 * TicketInsightsSkillParticipation helper cube. Powers the Skills page table.
 */
export const averageAiAgentCsatPerSkill = aiAgentCsatScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_CSAT_PER_SKILL)
    .defineQuery(() => ({
        measures: ['averageCSAT'] as const,
        dimensions: ['resourceSourceSetId', 'resourceSourceId'] as const,
    }))

export const averageAiAgentCsatPerSkillQueryFactory = (
    ctx: AiAgentCsatContext,
) => averageAiAgentCsatPerSkill.build(ctx)

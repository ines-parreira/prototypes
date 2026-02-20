import {
    METRIC_NAMES,
    type MetricName,
    MetricScope,
} from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const autoQAScope = defineScope({
    scope: MetricScope.AutoQA,
    measures: [
        'averageAccuracyScore',
        'averageBrandVoiceScore',
        'averageCommunicationSkillsScore',
        'averageEfficiencyScore',
        'averageInternalComplianceScore',
        'averageLanguageProficiencyScore',
        'averageResolutionCompletenessScore',
        'ticketCount',
    ],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'score',
        'integrationId',
        'tags',
        'customFields',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'storeId',
        'status',
    ],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId', 'storeId'],
    order: [
        'averageAccuracyScore',
        'averageBrandVoiceScore',
        'averageCommunicationSkillsScore',
        'averageEfficiencyScore',
        'averageInternalComplianceScore',
        'averageLanguageProficiencyScore',
        'averageResolutionCompletenessScore',
        'ticketId',
        'ticketCount',
    ],
})

type Values<T> = T extends readonly (infer U)[] ? U : never
type TMeta = (typeof autoQAScope)['config']

const buildAutoQAMetric = (
    metricName: MetricName,
    measure: Values<TMeta['measures']> & Values<TMeta['order']>,
    dimension?: Values<TMeta['dimensions']>,
) =>
    autoQAScope.defineMetricName(metricName).defineQuery(({ ctx, config }) => {
        let query = {
            measures: [measure],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'status',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['closed'],
                },
            ] as any,
            dimensions: dimension ? [dimension] : undefined,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [[measure, ctx.sortDirection]] as const,
            }
        }

        return query
    })

// Accuracy
export const accuracyMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_ACCURACY,
    'averageAccuracyScore',
)
export const accuracyQueryV2Factory = (ctx: Context) =>
    accuracyMetric.build(ctx)
export const accuracyPerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_ACCURACY_PER_AGENT,
    'averageAccuracyScore',
    'agentId',
)
export const accuracyPerAgentQueryV2Factory = (ctx: Context) =>
    accuracyPerAgentMetric.build(ctx)

// Brand voice
export const brandVoiceMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_BRAND_VOICE,
    'averageBrandVoiceScore',
)
export const brandVoiceQueryV2Factory = (ctx: Context) =>
    brandVoiceMetric.build(ctx)
export const brandVoicePerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_BRAND_VOICE_PER_AGENT,
    'averageBrandVoiceScore',
    'agentId',
)
export const brandVoicePerAgentQueryV2Factory = (ctx: Context) =>
    brandVoicePerAgentMetric.build(ctx)

// Communication skills
export const communicationSkillsMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_COMMUNICATION_SKILLS,
    'averageCommunicationSkillsScore',
)
export const communicationSkillsQueryV2Factory = (ctx: Context) =>
    communicationSkillsMetric.build(ctx)
export const communicationSkillsPerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_COMMUNICATION_SKILLS_PER_AGENT,
    'averageCommunicationSkillsScore',
    'agentId',
)
export const communicationSkillsPerAgentQueryV2Factory = (ctx: Context) =>
    communicationSkillsPerAgentMetric.build(ctx)

// Efficiency
export const efficiencyMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_EFFICIENCY,
    'averageEfficiencyScore',
)
export const efficiencyQueryV2Factory = (ctx: Context) =>
    efficiencyMetric.build(ctx)
export const efficiencyPerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_EFFICIENCY_PER_AGENT,
    'averageEfficiencyScore',
    'agentId',
)
export const efficiencyPerAgentQueryV2Factory = (ctx: Context) =>
    efficiencyPerAgentMetric.build(ctx)

// Internal compliance
export const internalComplianceMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_INTERNAL_COMPLIANCE,
    'averageInternalComplianceScore',
)
export const internalComplianceQueryV2Factory = (ctx: Context) =>
    internalComplianceMetric.build(ctx)
export const internalCompliancePerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_INTERNAL_COMPLIANCE_PER_AGENT,
    'averageInternalComplianceScore',
    'agentId',
)
export const internalCompliancePerAgentQueryV2Factory = (ctx: Context) =>
    internalCompliancePerAgentMetric.build(ctx)

// Language proficiency
export const languageProficiencyMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY,
    'averageLanguageProficiencyScore',
)
export const languageProficiencyQueryV2Factory = (ctx: Context) =>
    languageProficiencyMetric.build(ctx)
export const languageProficiencyPerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY_PER_AGENT,
    'averageLanguageProficiencyScore',
    'agentId',
)
export const languageProficiencyPerAgentQueryV2Factory = (ctx: Context) =>
    languageProficiencyPerAgentMetric.build(ctx)

// Resolution completeness
export const resolutionCompletenessMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_RESOLUTION_COMPLETENESS,
    'averageResolutionCompletenessScore',
)
export const resolutionCompletenessQueryV2Factory = (ctx: Context) =>
    resolutionCompletenessMetric.build(ctx)
export const resolutionCompletenessPerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_RESOLUTION_COMPLETENESS_PER_AGENT,
    'averageResolutionCompletenessScore',
    'agentId',
)
export const resolutionCompletenessPerAgentQueryV2Factory = (ctx: Context) =>
    resolutionCompletenessPerAgentMetric.build(ctx)

// Reviwed closed tickets
export const reviewedClosedTicketsMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS,
    'ticketCount',
)
export const reviewedClosedTicketsQueryV2Factory = (ctx: Context) =>
    reviewedClosedTicketsMetric.build(ctx)
export const reviewedClosedTicketsPerAgentMetric = buildAutoQAMetric(
    METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS_PER_AGENT,
    'ticketCount',
    'agentId',
)
export const reviewedClosedTicketsPerAgentQueryV2Factory = (ctx: Context) =>
    reviewedClosedTicketsPerAgentMetric.build(ctx)

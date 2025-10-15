import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const averageCsatScope = defineScope({
    scope: MetricScope.AverageCsat,
    measures: ['averageSurveyScore', 'scoredSurveysCount'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'surveyScore',
    ],
    timeDimensions: ['createdDatetime', 'sentDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'csatScores',
        'integrations',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracyScore',
        'efficiencyScore',
        'internalComplianceScore',
        'brandVoiceScore',
        'customFields',
        'tags',
    ],
    order: ['tickets', 'createdDatetime', 'surveyScore', 'scoredSurveysCount'],
})

export const averageScore = averageCsatScope
    .defineMetricName(METRIC_NAMES.SATISFACTION_AVERAGE_SCORE)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['averageSurveyScore'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['surveyScore', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerAgentTimeseries = averageCsatScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_AGENT_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['scoredSurveysCount'] as const,
            dimensions: ['agentId'] as const,
            time_dimensions: [
                {
                    dimension: 'sentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerChannelTimeseries = averageCsatScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_CHANNEL_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['scoredSurveysCount'] as const,
            dimensions: ['channel'] as const,
            time_dimensions: [
                {
                    dimension: 'sentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerIntegrationTimeseries = averageCsatScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_INTEGRATION_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['scoredSurveysCount'] as const,
            dimensions: ['integrationId'] as const,
            time_dimensions: [
                {
                    dimension: 'sentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

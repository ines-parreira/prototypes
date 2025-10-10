import { z } from 'zod'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const averageCsatScope = defineScope({
    scope: MetricScope.AverageCsat,
    measures: ['averageSurveyScore', 'scoredSurveysCount'],
    dimensions: [
        'tickets',
        'agents',
        'channels',
        'integrations',
        'surveyScore',
    ],
    timeDimensions: ['createdDatetime', 'surveySentDatetime'],
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

const direction = z.enum(['asc', 'desc'])

export const averageScore = averageCsatScope
    .defineMetricName(METRIC_NAMES.SATISFACTION_AVERAGE_SCORE)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['averageSurveyScore'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['surveyScore', input.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerAgentTimeseries = averageCsatScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_AGENT_TIME_SERIES,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query = {
            measures: ['scoredSurveysCount'] as const,
            dimensions: ['agents'] as const,
            time_dimensions: [
                {
                    dimension: 'surveySentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', input.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerChannelTimeseries = averageCsatScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_CHANNEL_TIME_SERIES,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query = {
            measures: ['scoredSurveysCount'] as const,
            dimensions: ['channels'] as const,
            time_dimensions: [
                {
                    dimension: 'surveySentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', input.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerIntegrationTimeseries = averageCsatScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_INTEGRATION_TIME_SERIES,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query = {
            measures: ['scoredSurveysCount'] as const,
            dimensions: ['integrations'] as const,
            time_dimensions: [
                {
                    dimension: 'surveySentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', input.sortDirection]] as const,
            }
        }

        return query
    })

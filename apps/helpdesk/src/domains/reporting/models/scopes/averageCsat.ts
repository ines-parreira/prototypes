import { z } from 'zod'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope, QueryFor } from './scope'
import { createScopeFilters } from './utils'

export const scopeConfig = defineScope({
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

type AverageCsatScopeMeta = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const averageCsatScope = initScope<AverageCsatScopeMeta, Context>().define(
    'average-csat',
)

const direction = z.enum(['asc', 'desc'])

export const averageScore = averageCsatScope
    .create(METRIC_NAMES.SATISFACTION_AVERAGE_SCORE)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<AverageCsatScopeMeta> = {
            measures: ['averageSurveyScore'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['surveyScore', input.sortDirection]]
        }

        return query
    })

export const averageCsatScorePerAgentTimeseries = averageCsatScope
    .create(METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_AGENT_TIME_SERIES)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<AverageCsatScopeMeta> = {
            measures: ['scoredSurveysCount'],
            dimensions: ['agents'],
            time_dimensions: [
                {
                    dimension: 'surveySentDatetime',
                    granularity: ctx.granularity,
                },
            ],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['scoredSurveysCount', input.sortDirection]]
        }

        return query
    })

export const averageCsatScorePerChannelTimeseries = averageCsatScope
    .create(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_CHANNEL_TIME_SERIES,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<AverageCsatScopeMeta> = {
            measures: ['scoredSurveysCount'],
            dimensions: ['channels'],
            time_dimensions: [
                {
                    dimension: 'surveySentDatetime',
                    granularity: ctx.granularity,
                },
            ],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['scoredSurveysCount', input.sortDirection]]
        }

        return query
    })

export const averageCsatScorePerIntegrationTimeseries = averageCsatScope
    .create(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_INTEGRATION_TIME_SERIES,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<AverageCsatScopeMeta> = {
            measures: ['scoredSurveysCount'],
            dimensions: ['integrations'],
            time_dimensions: [
                {
                    dimension: 'surveySentDatetime',
                    granularity: ctx.granularity,
                },
            ],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['scoredSurveysCount', input.sortDirection]]
        }

        return query
    })

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

// TODO use correct type to dimensions in scope
export type SatisfactionSurveysDimension =
    | 'ticketId'
    | 'agentId'
    | 'channel'
    | 'integrationId'
    | 'surveyScore'

export const satisfactionSurveysScope = defineScope({
    scope: MetricScope.SatisfactionSurveys,
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
        'agentId',
        'teamId',
        'channel',
        'score',
        'integrationId',
        'storeId',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'customFields',
        'tags',
    ],
    order: [
        'tickets',
        'createdDatetime',
        'averageSurveyScore',
        'surveyScore',
        'scoredSurveysCount',
    ],
})

export type SatisfactionSurveysContext = Context<
    typeof satisfactionSurveysScope.config
>

export const averageScore = satisfactionSurveysScope
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

export const averageScoreQueryV2Factory = (ctx: SatisfactionSurveysContext) =>
    averageScore.build(ctx)

export const averageCsatScorePerAgentTimeseries = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_AGENT_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['averageSurveyScore', 'scoredSurveysCount'] as const,
            dimensions: ['agentId'] as const,
            time_dimensions: [
                {
                    dimension: 'sentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
            limit: 10_000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerAgentTimeseriesQueryV2Factory = (
    ctx: SatisfactionSurveysContext,
) => averageCsatScorePerAgentTimeseries.build(ctx)

export const averageCsatScorePerChannelTimeseries = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_CHANNEL_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['averageSurveyScore', 'scoredSurveysCount'] as const,
            dimensions: ['channel'] as const,
            time_dimensions: [
                {
                    dimension: 'sentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
            limit: 10_000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerChannelTimeseriesQueryV2Factory = (
    ctx: SatisfactionSurveysContext,
) => averageCsatScorePerChannelTimeseries.build(ctx)

export const averageCsatScorePerIntegrationTimeseries = satisfactionSurveysScope
    .defineMetricName(
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_INTEGRATION_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['averageSurveyScore', 'scoredSurveysCount'] as const,
            dimensions: ['integrationId'] as const,
            time_dimensions: [
                {
                    dimension: 'sentDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
            limit: 10_000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['scoredSurveysCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const averageCsatScorePerIntegrationTimeseriesQueryV2Factory = (
    ctx: SatisfactionSurveysContext,
) => averageCsatScorePerIntegrationTimeseries.build(ctx)

export const integrationCsatQueryBuilder = {
    [TicketDimension.AssigneeUserId]:
        averageCsatScorePerAgentTimeseriesQueryV2Factory,
    [TicketDimension.Channel]:
        averageCsatScorePerChannelTimeseriesQueryV2Factory,
    [TicketMessagesDimension.Integration]:
        averageCsatScorePerIntegrationTimeseriesQueryV2Factory,
}

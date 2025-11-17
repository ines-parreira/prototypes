import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const averageCSATScorePerDimensionQueryFactory = (
    dimension: string,
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): Omit<ReportingQuery<HelpdeskMessageCubeWithJoins>, 'metricName'> => ({
    measures: [
        TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
    ],
    dimensions: [dimension as TicketDimension],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.ScoredSurveysCount, sorting],
              ],
          }
        : {}),
})

const integrationToMetricName = {
    [TicketDimension.AssigneeUserId]:
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_AGENT_TIME_SERIES,
    [TicketDimension.Channel]:
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_CHANNEL_TIME_SERIES,
    [TicketMessagesDimension.Integration]:
        METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_INTEGRATION_TIME_SERIES,
}

export const averageCSATScorePerDimensionTimeSeriesFactory = (
    dimension:
        | TicketDimension.AssigneeUserId
        | TicketDimension.Channel
        | TicketMessagesDimension.Integration,
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...averageCSATScorePerDimensionQueryFactory(
        dimension,
        filters,
        timezone,
        sorting,
    ),
    metricName: integrationToMetricName[dimension],
    timeDimensions: [
        {
            dimension: TicketSatisfactionSurveyDimension.SurveySentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const averageCSATScorePerDimensionDrillDownQueryFactory =
    (dimension: string) =>
    (
        filters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
    ): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
        ...averageCSATScorePerDimensionQueryFactory(
            dimension,
            filters,
            timezone,
            sorting,
        ),
        metricName:
            METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_DIMENSION_DRILL_DOWN,
        dimensions: [TicketDimension.TicketId],
        filters: [
            ...averageCSATScorePerDimensionQueryFactory(
                dimension,
                filters,
                timezone,
                sorting,
            ).filters,
            {
                member: TicketSatisfactionSurveyDimension.SurveySentDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        limit: DRILLDOWN_QUERY_LIMIT,
    })

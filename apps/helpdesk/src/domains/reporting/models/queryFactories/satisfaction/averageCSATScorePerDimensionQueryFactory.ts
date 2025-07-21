import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const averageCSATScorePerDimensionQueryFactory = (
    dimension: string,
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
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

export const averageCSATScorePerDimensionTimeSeriesFactory = (
    dimension: string,
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

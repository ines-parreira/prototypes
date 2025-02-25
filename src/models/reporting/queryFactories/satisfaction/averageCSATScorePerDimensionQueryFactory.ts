import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

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

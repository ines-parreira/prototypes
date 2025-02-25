import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const surveysSentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketSatisfactionSurveyMeasure.SentSurveysCount],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.SentSurveysCount, sorting],
              ],
          }
        : {}),
})

export const surveysSentDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...surveysSentQueryFactory(filters, timezone, sorting),
    measures: [TicketSatisfactionSurveyMeasure.SentSurveysCount],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
    ],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})

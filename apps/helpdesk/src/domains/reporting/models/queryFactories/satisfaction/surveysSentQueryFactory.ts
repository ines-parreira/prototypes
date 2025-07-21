import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
        {
            member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
        ...NotSpamNorTrashedTicketsFilter,
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
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})

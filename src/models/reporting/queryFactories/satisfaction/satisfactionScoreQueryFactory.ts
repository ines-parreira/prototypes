import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const satisfactionScoreQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.SatisfactionScore, sorting],
              ],
          }
        : {}),
})

export const satisfactionScoreDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...satisfactionScoreQueryFactory(filters, timezone, sorting),
    measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketSatisfactionSurveyDimension.SurveyScore,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
    ],
    dimensions: [
        TicketDimension.TicketId,
        TicketSatisfactionSurveyDimension.SurveyScore,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting && {
        order: [[TicketSatisfactionSurveyDimension.SurveyScore, sorting]],
    }),
})

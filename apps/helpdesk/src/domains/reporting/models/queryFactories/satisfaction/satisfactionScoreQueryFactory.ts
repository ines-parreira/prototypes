import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
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

export const satisfactionScoreQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    metricName: METRIC_NAMES.SATISFACTION_SATISFACTION_SCORE,
    measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketSatisfactionSurveyDimension.SurveyScore,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
        ...NotSpamNorTrashedTicketsFilter,
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
    metricName: METRIC_NAMES.SATISFACTION_SATISFACTION_SCORE_DRILL_DOWN,
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    dimensions: [
        TicketDimension.TicketId,
        TicketSatisfactionSurveyDimension.SurveyScore,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting && {
        order: [[TicketSatisfactionSurveyDimension.SurveyScore, sorting]],
    }),
})

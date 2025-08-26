import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'

export const surveyScoresQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketSatisfactionSurveyMeasure.ScoredSurveysCount],
    dimensions: [TicketSatisfactionSurveyDimension.SurveyScore],
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
    metricName: METRIC_NAMES.SATISFACTION_SURVEY_SCORES,
})

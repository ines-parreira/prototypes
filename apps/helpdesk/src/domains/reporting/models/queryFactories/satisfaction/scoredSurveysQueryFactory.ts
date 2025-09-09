import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { ScoredSurveySortingType } from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
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

export const scoredSurveysQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting: ScoredSurveySortingType,
    limit: number = 100,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [],
    dimensions: [
        TicketDimension.TicketId,
        TicketDimension.SurveyScore,
        TicketSatisfactionSurveyDimension.SurveyCustomerId,
        TicketSatisfactionSurveyDimension.SurveyComment,
        TicketSatisfactionSurveyDimension.SurveyScoredDatetime,
    ],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketDimension.SurveyScore,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
        ...NotSpamNorTrashedTicketsFilter,
    ],
    order: [[sorting.sortBy, sorting.sortDirection]],
    timezone,
    metricName: METRIC_NAMES.SATISFACTION_SCORED_SURVEYS,
    limit,
})

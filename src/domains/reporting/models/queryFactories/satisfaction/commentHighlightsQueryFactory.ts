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
import { OrderDirection } from 'models/api/types'

export const commentHighlightsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    surveyScores: string[],
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [],
    dimensions: [
        TicketDimension.TicketId,
        TicketDimension.SurveyScore,
        TicketDimension.AssigneeUserId,
        TicketDimension.AssigneeTeamId,
        TicketSatisfactionSurveyDimension.SurveyComment,
        TicketSatisfactionSurveyDimension.SurveyCommentLength,
    ],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketDimension.SurveyScore,
            operator: ReportingFilterOperator.Equals,
            values: surveyScores,
        },
        ...NotSpamNorTrashedTicketsFilter,
    ],
    order: [
        [
            TicketSatisfactionSurveyDimension.SurveyCommentLength,
            OrderDirection.Desc,
        ],
    ],
    timezone,
    limit: 3,
})

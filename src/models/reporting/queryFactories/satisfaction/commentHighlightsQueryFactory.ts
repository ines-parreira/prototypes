import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

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

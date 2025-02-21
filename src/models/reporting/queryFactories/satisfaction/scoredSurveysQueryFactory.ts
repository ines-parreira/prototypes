import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const scoredSurveysQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    limit: number = 100
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
    ],
    order: [
        [
            TicketSatisfactionSurveyDimension.SurveyScoredDatetime,
            OrderDirection.Desc,
        ],
    ],
    timezone,
    limit,
})

import moment from 'moment'

import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import {commentHighlightsQueryFactory} from '../commentHighlightsQueryFactory'

describe('commentHighlightsQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const surveyScores = ['1', '2', '3', '4', '5']
    it('should produce the query', () => {
        const query = commentHighlightsQueryFactory(
            statsFilters,
            timezone,
            surveyScores
        )

        expect(query).toEqual({
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.SurveyScore,
                TicketDimension.AssigneeUserId,
                TicketSatisfactionSurveyDimension.SurveyCustomerId,
                TicketSatisfactionSurveyDimension.SurveyComment,
                TicketSatisfactionSurveyDimension.SurveyCommentLength,
            ],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.SurveyScore,
                    operator: ReportingFilterOperator.Equals,
                    values: surveyScores,
                },
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
    })
})

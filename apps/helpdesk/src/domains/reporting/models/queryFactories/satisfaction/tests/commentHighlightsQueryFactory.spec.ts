import moment from 'moment'

import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { commentHighlightsQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/commentHighlightsQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
            surveyScores,
        )

        expect(query).toEqual({
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
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
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
    })
})

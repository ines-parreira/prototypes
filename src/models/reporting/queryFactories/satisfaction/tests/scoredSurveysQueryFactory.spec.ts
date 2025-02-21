import moment from 'moment'

import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {scoredSurveysQueryFactory} from 'models/reporting/queryFactories/satisfaction/scoredSurveysQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('scoredSurveysQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const limit = 30

    it('should produce the query with default limit when not passed', () => {
        const query = scoredSurveysQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
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
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
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
            limit: 100,
        })
    })

    it('should produce the query with passed limit', () => {
        const query = scoredSurveysQueryFactory(statsFilters, timezone, limit)

        expect(query).toEqual({
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
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
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
            limit: 30,
        })
    })
})

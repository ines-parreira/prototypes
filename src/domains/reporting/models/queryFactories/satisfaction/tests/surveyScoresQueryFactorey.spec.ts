import moment from 'moment'

import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { surveyScoresQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/surveyScoresQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'

describe('surveyScoresQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'

    it('should produce the query', () => {
        const query = surveyScoresQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.ScoredSurveysCount],
            dimensions: [TicketSatisfactionSurveyDimension.SurveyScore],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketSatisfactionSurveyDimension.SurveyScore,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
                ...NotSpamNorTrashedTicketsFilter,
            ],
            timezone,
        })
    })
})

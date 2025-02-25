import moment from 'moment'

import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { surveyScoresQueryFactory } from 'models/reporting/queryFactories/satisfaction/surveyScoresQueryFactory'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

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
            ],
            timezone,
        })
    })
})

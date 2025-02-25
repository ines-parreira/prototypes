import moment from 'moment'

import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketSatisfactionSurveyMeasure } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    surveysSentDrillDownQueryFactory,
    surveysSentQueryFactory,
} from 'models/reporting/queryFactories/satisfaction/surveysSentQueryFactory'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('surveysSentQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc

    it('should produce the query', () => {
        const query = surveysSentQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.SentSurveysCount],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = surveysSentQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.SentSurveysCount],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
            ],
            timezone,
            order: [
                [TicketSatisfactionSurveyMeasure.SentSurveysCount, sorting],
            ],
        })
    })
})

describe('surveysSentDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc

    it('should produce the query', () => {
        const query = surveysSentDrillDownQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.SentSurveysCount],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = surveysSentDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.SentSurveysCount],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
            ],
            timezone,
            order: [
                [TicketSatisfactionSurveyMeasure.SentSurveysCount, sorting],
            ],
        })
    })
})

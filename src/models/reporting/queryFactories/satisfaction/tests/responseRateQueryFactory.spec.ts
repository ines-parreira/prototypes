import moment from 'moment'

import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'

import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    responseRateQueryFactory,
    responseRateDrillDownQueryFactory,
} from 'models/reporting/queryFactories/satisfaction/responseRateQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('responseRateQueryFactory', () => {
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
        const query = responseRateQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.ResponseRate],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = responseRateQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.ResponseRate],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
            ],
            timezone,
            order: [[TicketSatisfactionSurveyMeasure.ResponseRate, sorting]],
        })
    })
})

describe('responseRateDrillDownQueryFactory', () => {
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
        const query = responseRateDrillDownQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.ResponseRate],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
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
        const query = responseRateDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.ResponseRate],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
            ],
            timezone,
            order: [[TicketSatisfactionSurveyMeasure.ResponseRate, sorting]],
        })
    })
})

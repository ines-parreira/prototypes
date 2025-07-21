import moment from 'moment'

import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    surveysSentDrillDownQueryFactory,
    surveysSentQueryFactory,
} from 'domains/reporting/models/queryFactories/satisfaction/surveysSentQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
                {
                    member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
                ...NotSpamNorTrashedTicketsFilter,
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
                {
                    member: TicketSatisfactionSurveyMeasure.SentSurveysCount,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
                ...NotSpamNorTrashedTicketsFilter,
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
                ...NotSpamNorTrashedTicketsFilter,
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
                ...NotSpamNorTrashedTicketsFilter,
            ],
            timezone,
            order: [
                [TicketSatisfactionSurveyMeasure.SentSurveysCount, sorting],
            ],
        })
    })
})

import moment from 'moment'

import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    satisfactionScoreDrillDownQueryFactory,
    satisfactionScoreQueryFactory,
} from 'domains/reporting/models/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('satisfactionScoreQueryFactory', () => {
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
        const query = satisfactionScoreQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
            dimensions: [],
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

    it('should produce the query with sorting', () => {
        const query = satisfactionScoreQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
            dimensions: [],
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
            order: [
                [TicketSatisfactionSurveyMeasure.SatisfactionScore, sorting],
            ],
        })
    })
})

describe('satisfactionScoreDrillDownQueryFactory', () => {
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
        const query = satisfactionScoreDrillDownQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
            dimensions: [
                TicketDimension.TicketId,
                TicketSatisfactionSurveyDimension.SurveyScore,
            ],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
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

    it('should produce the query with sorting by SurveyScore', () => {
        const query = satisfactionScoreDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.SatisfactionScore],
            dimensions: [
                TicketDimension.TicketId,
                TicketSatisfactionSurveyDimension.SurveyScore,
            ],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
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
            order: [[TicketSatisfactionSurveyDimension.SurveyScore, sorting]],
        })
    })
})

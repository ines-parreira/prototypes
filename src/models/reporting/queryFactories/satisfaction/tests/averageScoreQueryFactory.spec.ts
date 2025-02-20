import moment from 'moment'

import {OrderDirection} from 'models/api/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    averageScoreDrillDownQueryFactory,
    averageScoreQueryFactory,
} from 'models/reporting/queryFactories/satisfaction/averageScoreQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('averageScoreQueryFactory', () => {
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
        const query = averageScoreQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            dimensions: [],
            segments: [],
            filters: statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statsFilters
            ),
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = averageScoreQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            dimensions: [],
            segments: [],
            filters: statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statsFilters
            ),

            timezone,
            order: [[TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting]],
        })
    })
})

describe('averageScoreDrillDownQueryFactory', () => {
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
        const query = averageScoreDrillDownQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            dimensions: [TicketDimension.TicketId],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
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

    it('should produce the query with sorting', () => {
        const query = averageScoreDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            dimensions: [TicketDimension.TicketId],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketSatisfactionSurveyDimension.SurveyScore,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
            ],
            timezone,
            order: [[TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting]],
        })
    })
})

import moment from 'moment'

import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    averageScoreDrillDownQueryFactory,
    averageScoreDrillDownWithScoreQueryBuilder,
    averageScoreQueryFactory,
    SatisfactionSurveyScore,
} from 'models/reporting/queryFactories/satisfaction/averageScoreQueryFactory'
import { withLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
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
        const query = averageScoreQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
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
        const query = averageScoreDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
            dimensions: [TicketDimension.TicketId],
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
            order: [[TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting]],
        })
    })
})

describe('averageScoreDrillDownWithScoreQueryBuilder', () => {
    const periodStart = moment()
    const periodEnd = moment(periodStart).add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart.toISOString(),
            end_datetime: periodEnd.toISOString(),
        },
        aggregationWindow: ReportingGranularity.Week,
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Desc
    const score = SatisfactionSurveyScore.Five

    it('should produce the query without sorting', () => {
        const builder = averageScoreDrillDownWithScoreQueryBuilder(score)
        const query = builder(statsFilters, timezone)

        const expectedFilters = {
            ...statsFilters,
            score: withLogicalOperator([score]),
        }
        const expectedQuery = averageScoreDrillDownQueryFactory(
            expectedFilters,
            timezone,
        )

        expect(query).toEqual(expectedQuery)
    })

    it('should produce the query with sorting', () => {
        const builder = averageScoreDrillDownWithScoreQueryBuilder(score)
        const query = builder(statsFilters, timezone, sorting)

        const expectedFilters = {
            ...fromLegacyStatsFilters(statsFilters as any),
            score: withLogicalOperator([score]),
        }
        const expectedQuery = averageScoreDrillDownQueryFactory(
            expectedFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual(expectedQuery)
    })
})

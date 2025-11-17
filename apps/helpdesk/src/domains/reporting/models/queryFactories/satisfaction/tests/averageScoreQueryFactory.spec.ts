import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    averageScoreDrillDownQueryFactory,
    averageScoreDrillDownWithScoreQueryBuilder,
    averageScoreQueryFactory,
    SatisfactionSurveyScore,
} from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
            metricName: METRIC_NAMES.SATISFACTION_AVERAGE_SCORE,
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
            metricName: METRIC_NAMES.SATISFACTION_AVERAGE_SCORE,
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
            metricName: METRIC_NAMES.SATISFACTION_AVERAGE_SCORE_DRILL_DOWN,
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
            metricName: METRIC_NAMES.SATISFACTION_AVERAGE_SCORE_DRILL_DOWN,
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

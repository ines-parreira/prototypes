import moment from 'moment'
import {
    resolvedTicketsDrillDownQueryFactory,
    resolvedTicketsQueryFactory,
} from 'models/reporting/queryFactories/auto-qa/resolvedTicketsQueryFactory'
import {OrderDirection} from 'models/api/types'
import {
    TicketQAScoreDimension,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('resolvedTicketsQueryFactory', () => {
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
        const query = resolvedTicketsQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [
                TicketQAScoreMeasure.TicketCount,
                TicketQAScoreMeasure.AverageScore,
            ],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['resolution_completeness'],
                },
                {
                    member: TicketQAScoreDimension.Prediction,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = resolvedTicketsQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            measures: [
                TicketQAScoreMeasure.TicketCount,
                TicketQAScoreMeasure.AverageScore,
            ],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['resolution_completeness'],
                },
                {
                    member: TicketQAScoreDimension.Prediction,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

describe('resolvedTicketsDrillDownQueryFactory', () => {
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
        const query = resolvedTicketsDrillDownQueryFactory(
            statsFilters,
            timezone
        )

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['resolution_completeness'],
                },
                {
                    member: TicketQAScoreDimension.Prediction,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = resolvedTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: ['closed'],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: ['resolution_completeness'],
                },
                {
                    member: TicketQAScoreDimension.Prediction,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

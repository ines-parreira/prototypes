import moment from 'moment'
import {OrderDirection} from 'models/api/types'
import {TicketQAScoreMeasure} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    reviewedClosedTicketsDrillDownQueryFactory,
    reviewedClosedTicketsQueryFactory,
} from 'models/reporting/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('reviewedClosedTicketsQueryFactory', () => {
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
        const query = reviewedClosedTicketsQueryFactory(statsFilters, timezone)

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
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = reviewedClosedTicketsQueryFactory(
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
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

describe('reviewedClosedTicketsDrillDownQueryFactory', () => {
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
        const query = reviewedClosedTicketsDrillDownQueryFactory(
            statsFilters,
            timezone
        )

        expect(query).toEqual({
            measures: [],
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
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = reviewedClosedTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            measures: [],
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
            ],
            timezone,
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})

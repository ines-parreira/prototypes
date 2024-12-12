import moment from 'moment'

import {TicketStatus} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    accuracyDrillDownQueryFactory,
    accuracyQueryFactory,
} from 'models/reporting/queryFactories/auto-qa/accuracyQueryFactory'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('accuracyQueryFactory', () => {
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
        const query = accuracyQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
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
                    values: [TicketStatus.Closed],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketQAScoreDimensionName.Accuracy],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = accuracyQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageScore],
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
                    values: [TicketStatus.Closed],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketQAScoreDimensionName.Accuracy],
                },
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

describe('accuracyDrillDownQueryFactory', () => {
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
        const query = accuracyDrillDownQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [
                TicketQAScoreMeasure.AverageScore,
                TicketQAScoreMeasure.QAScoreData,
            ],
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
                    values: [TicketStatus.Closed],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketQAScoreDimensionName.Accuracy],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = accuracyDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [
                TicketQAScoreMeasure.AverageScore,
                TicketQAScoreMeasure.QAScoreData,
            ],
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
                    values: [TicketStatus.Closed],
                },
                {
                    member: TicketQAScoreDimension.DimensionName,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketQAScoreDimensionName.Accuracy],
                },
            ],
            timezone,
            order: [[TicketQAScoreMeasure.AverageScore, sorting]],
        })
    })
})

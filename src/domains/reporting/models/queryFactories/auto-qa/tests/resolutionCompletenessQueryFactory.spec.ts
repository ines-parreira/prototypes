import moment from 'moment'

import { TicketStatus } from 'business/types/ticket'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    resolutionCompletenessDrillDownQueryFactory,
    resolutionCompletenessQueryFactory,
} from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('resolutionCompletenessQueryFactory', () => {
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
        const query = resolutionCompletenessQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageResolutionCompletenessScore],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketStatus.Closed],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = resolutionCompletenessQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            measures: [TicketQAScoreMeasure.AverageResolutionCompletenessScore],
            dimensions: [],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketStatus.Closed],
                },
            ],
            timezone,
            order: [
                [
                    TicketQAScoreMeasure.AverageResolutionCompletenessScore,
                    sorting,
                ],
            ],
        })
    })
})

describe('resolutionCompletenessDrillDownQueryFactory', () => {
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
        const query = resolutionCompletenessDrillDownQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageResolutionCompletenessScore],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketStatus.Closed],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = resolutionCompletenessDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageResolutionCompletenessScore],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketDimension.Status,
                    operator: ReportingFilterOperator.Equals,
                    values: [TicketStatus.Closed],
                },
            ],
            timezone,
            order: [
                [
                    TicketQAScoreMeasure.AverageResolutionCompletenessScore,
                    sorting,
                ],
            ],
        })
    })
})

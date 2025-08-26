import moment from 'moment'

import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    internalComplianceDrillDownQueryFactory,
    internalComplianceQueryFactory,
} from 'domains/reporting/models/queryFactories/auto-qa/internalComplianceQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('internalComplianceQueryFactory', () => {
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
        const query = internalComplianceQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_INTERNAL_COMPLIANCE,
            measures: [TicketQAScoreMeasure.AverageInternalComplianceScore],
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
        const query = internalComplianceQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_INTERNAL_COMPLIANCE,
            measures: [TicketQAScoreMeasure.AverageInternalComplianceScore],
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
                [TicketQAScoreMeasure.AverageInternalComplianceScore, sorting],
            ],
        })
    })
})

describe('internalComplianceDrillDownQueryFactory', () => {
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
        const query = internalComplianceDrillDownQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_INTERNAL_COMPLIANCE_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageInternalComplianceScore],
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
        const query = internalComplianceDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_INTERNAL_COMPLIANCE_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageInternalComplianceScore],
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
                [TicketQAScoreMeasure.AverageInternalComplianceScore, sorting],
            ],
        })
    })
})

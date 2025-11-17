import moment from 'moment'

import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    reviewedClosedTicketsDrillDownQueryFactory,
    reviewedClosedTicketsQueryFactory,
} from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
            metricName: METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS,
            measures: [TicketQAScoreMeasure.TicketCount],
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
        const query = reviewedClosedTicketsQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS,
            measures: [TicketQAScoreMeasure.TicketCount],
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
            order: [[TicketQAScoreMeasure.TicketCount, sorting]],
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
            timezone,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [
                TicketQAScoreMeasure.QAScoreData,
                TicketQAScoreMeasure.AverageAccuracyScore,
                TicketQAScoreMeasure.AverageBrandVoiceScore,
                TicketQAScoreMeasure.AverageCommunicationSkillsScore,
                TicketQAScoreMeasure.AverageEfficiencyScore,
                TicketQAScoreMeasure.AverageInternalComplianceScore,
                TicketQAScoreMeasure.AverageLanguageProficiencyScore,
                TicketQAScoreMeasure.AverageResolutionCompletenessScore,
            ],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
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
        const query = reviewedClosedTicketsDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [
                TicketQAScoreMeasure.QAScoreData,
                TicketQAScoreMeasure.AverageAccuracyScore,
                TicketQAScoreMeasure.AverageBrandVoiceScore,
                TicketQAScoreMeasure.AverageCommunicationSkillsScore,
                TicketQAScoreMeasure.AverageEfficiencyScore,
                TicketQAScoreMeasure.AverageInternalComplianceScore,
                TicketQAScoreMeasure.AverageLanguageProficiencyScore,
                TicketQAScoreMeasure.AverageResolutionCompletenessScore,
            ],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
            ],
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
            order: [[TicketDimension.CreatedDatetime, sorting]],
        })
    })
})

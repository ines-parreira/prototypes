import moment from 'moment'

import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    brandVoiceDrillDownQueryFactory,
    brandVoiceQueryFactory,
} from 'domains/reporting/models/queryFactories/auto-qa/brandVoiceQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('brandVoiceQueryFactory', () => {
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
        const query = brandVoiceQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_BRAND_VOICE,
            measures: [TicketQAScoreMeasure.AverageBrandVoiceScore],
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
        const query = brandVoiceQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_BRAND_VOICE,
            measures: [TicketQAScoreMeasure.AverageBrandVoiceScore],
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
            order: [[TicketQAScoreMeasure.AverageBrandVoiceScore, sorting]],
        })
    })
})

describe('brandVoiceDrillDownQueryFactory', () => {
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
        const query = brandVoiceDrillDownQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_BRAND_VOICE_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageBrandVoiceScore],
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
        const query = brandVoiceDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_BRAND_VOICE_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageBrandVoiceScore],
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
            order: [[TicketQAScoreMeasure.AverageBrandVoiceScore, sorting]],
        })
    })
})

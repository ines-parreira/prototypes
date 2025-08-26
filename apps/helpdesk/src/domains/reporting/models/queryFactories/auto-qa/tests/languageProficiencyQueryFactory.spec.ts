import moment from 'moment'

import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    languageProficiencyDrillDownQueryFactory,
    languageProficiencyQueryFactory,
} from 'domains/reporting/models/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('languageProficiencyQueryFactory', () => {
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
        const query = languageProficiencyQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY,
            measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
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
        const query = languageProficiencyQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY,
            measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
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
                [TicketQAScoreMeasure.AverageLanguageProficiencyScore, sorting],
            ],
        })
    })
})

describe('languageProficiencyDrillDownQueryFactory', () => {
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
        const query = languageProficiencyDrillDownQueryFactory(
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
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
        const query = languageProficiencyDrillDownQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.AUTO_QA_LANGUAGE_PROFICIENCY_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
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
                [TicketQAScoreMeasure.AverageLanguageProficiencyScore, sorting],
            ],
        })
    })
})

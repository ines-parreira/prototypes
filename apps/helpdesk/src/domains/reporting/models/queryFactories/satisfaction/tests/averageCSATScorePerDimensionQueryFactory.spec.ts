import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { averageCSATScorePerDimensionDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('averageCSATScorePerDimensionDrillDownQueryFactory', () => {
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
        const query = averageCSATScorePerDimensionDrillDownQueryFactory(
            TicketDimension.Channel,
        )(statsFilters, timezone)

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_DIMENSION_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
            ],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketSatisfactionSurveyDimension.SurveySentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(periodStart.toISOString()),
                        formatReportingQueryDate(periodEnd.toISOString()),
                    ],
                },
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = averageCSATScorePerDimensionDrillDownQueryFactory(
            TicketDimension.Channel,
        )(statsFilters, timezone, sorting)

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.SATISFACTION_AVERAGE_CSAT_SCORE_PER_DIMENSION_DRILL_DOWN,
            limit: DRILLDOWN_QUERY_LIMIT,
            measures: [
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
            ],
            dimensions: [TicketDimension.TicketId],
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketSatisfactionSurveyDimension.SurveySentDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(periodStart.toISOString()),
                        formatReportingQueryDate(periodEnd.toISOString()),
                    ],
                },
            ],
            timezone,
            order: [
                [TicketSatisfactionSurveyMeasure.ScoredSurveysCount, sorting],
            ],
        })
    })
})

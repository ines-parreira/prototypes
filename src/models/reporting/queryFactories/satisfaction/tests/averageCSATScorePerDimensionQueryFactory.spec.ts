import moment from 'moment'

import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    averageCSATScorePerDimensionDrillDownQueryFactory,
    averageCSATScorePerDimensionQueryFactory,
} from 'models/reporting/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

describe('averageCSATScorePerDimensionQueryFactory', () => {
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

    const dimension = {
        label: 'Channel',
        value: TicketDimension.Channel,
    }

    it('should produce the query', () => {
        const query = averageCSATScorePerDimensionQueryFactory(
            dimension.value,
            statsFilters,
            timezone,
        )

        expect(query).toEqual({
            measures: [
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
            ],
            dimensions: [TicketDimension.Channel],
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
            ],
            timezone,
        })
    })

    it('should produce the query with sorting', () => {
        const query = averageCSATScorePerDimensionQueryFactory(
            dimension.value,
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            measures: [
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
            ],
            dimensions: [TicketDimension.Channel],
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
            ],
            timezone,
            order: [
                [TicketSatisfactionSurveyMeasure.ScoredSurveysCount, sorting],
            ],
        })
    })
})

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

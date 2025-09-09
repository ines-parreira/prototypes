import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { ScoredSurveySortDefaultValues } from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { scoredSurveysQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/scoredSurveysQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('scoredSurveysQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }
    const timezone = 'someTimeZone'
    const limit = 30
    const sorting = ScoredSurveySortDefaultValues

    it('should produce the query with default limit when not passed', () => {
        const query = scoredSurveysQueryFactory(statsFilters, timezone, sorting)

        expect(query).toEqual({
            metricName: METRIC_NAMES.SATISFACTION_SCORED_SURVEYS,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.SurveyScore,
                TicketSatisfactionSurveyDimension.SurveyCustomerId,
                TicketSatisfactionSurveyDimension.SurveyComment,
                TicketSatisfactionSurveyDimension.SurveyScoredDatetime,
            ],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketDimension.SurveyScore,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
                ...NotSpamNorTrashedTicketsFilter,
            ],
            order: [
                [
                    TicketSatisfactionSurveyDimension.SurveyScoredDatetime,
                    OrderDirection.Desc,
                ],
            ],
            timezone,
            limit: 100,
        })
    })

    it('should produce the query with passed limit', () => {
        const query = scoredSurveysQueryFactory(
            statsFilters,
            timezone,
            sorting,
            limit,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.SATISFACTION_SCORED_SURVEYS,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.SurveyScore,
                TicketSatisfactionSurveyDimension.SurveyCustomerId,
                TicketSatisfactionSurveyDimension.SurveyComment,
                TicketSatisfactionSurveyDimension.SurveyScoredDatetime,
            ],
            segments: [],
            filters: [
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
                {
                    member: TicketDimension.SurveyScore,
                    operator: ReportingFilterOperator.Gt,
                    values: ['0'],
                },
                ...NotSpamNorTrashedTicketsFilter,
            ],
            order: [
                [
                    TicketSatisfactionSurveyDimension.SurveyScoredDatetime,
                    OrderDirection.Desc,
                ],
            ],
            timezone,
            limit: 30,
        })
    })
})

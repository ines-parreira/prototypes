import { OrderDirection } from 'models/api/types'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import { TicketMember } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    aiAgentTicketsWithIntentQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import { ReportingFilterOperator } from 'models/reporting/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
} from 'utils/reporting'

describe('AI Agent metrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }

    it('customerSatisfactionPerIntentLevelQueryFactory', () => {
        expect(
            customerSatisfactionPerIntentLevelQueryFactory(filters, timezone),
        ).toEqual({
            dimensions: [
                TicketSatisfactionSurveyDimension.TicketId,
                TicketSatisfactionSurveyDimension.SurveyScore,
            ],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                    ],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
            ],
            measures: [
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
            ],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            timezone: timezone,
        })
    })

    it('customerSatisfactionPerIntentLevelQueryFactory with user id', () => {
        expect(
            customerSatisfactionPerIntentLevelQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
                '1',
            ),
        ).toEqual({
            dimensions: [
                TicketSatisfactionSurveyDimension.TicketId,
                TicketSatisfactionSurveyDimension.SurveyScore,
            ],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                    ],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
            ],
            order: [['TicketSatisfactionSurveyEnriched.avgSurveyScore', 'asc']],
            measures: [
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
            ],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            timezone: timezone,
        })
    })

    it('recommendedResourceQueryFactory', () => {
        expect(
            recommendedResourceQueryFactory(filters, timezone, ['1', '2']),
        ).toEqual({
            dimensions: [
                RecommendedResourcesDimension.TicketId,
                RecommendedResourcesDimension.RecommendedResourceId,
            ],
            filters: [
                {
                    member: RecommendedResourcesFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                    ],
                },
                {
                    member: RecommendedResourcesFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
                {
                    member: RecommendedResourcesFilterMember.TicketId,
                    operator: ReportingFilterOperator.In,
                    values: ['1', '2'],
                },
            ],
            measures: [RecommendedResourcesMeasure.NumRecommendedResources],
            timezone: timezone,
        })
    })

    it('aiAgentTicketsWithIntentQueryFactory without intent and outcome field ids', () => {
        const result = aiAgentTicketsWithIntentQueryFactory(filters, timezone)
        expect(result).toEqual({
            measures: [],
            dimensions: [
                'TicketEnriched.ticketId',
                'TicketEnriched.customField',
            ],
            timezone: 'UTC',
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: 'TicketCustomFieldsEnriched.customFieldUpdatedDatetime',
                    operator: 'inDateRange',
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
            ],
        })
    })

    it('aiAgentTicketsWithIntentQueryFactory with intent and outcome field ids', () => {
        const result = aiAgentTicketsWithIntentQueryFactory(
            filters,
            timezone,
            1,
            ['1', '2'],
            OrderDirection.Asc,
            'intent1',
        )
        expect(result).toEqual({
            measures: [],
            dimensions: [
                'TicketEnriched.ticketId',
                'TicketEnriched.customField',
            ],
            timezone: 'UTC',
            filters: [
                {
                    member: 'TicketEnriched.customField',
                    operator: 'startsWith',
                    values: ['1::intent1'],
                },
                {
                    member: 'TicketEnriched.ticketId',
                    operator: 'in',
                    values: ['1', '2'],
                },
                ...NotSpamNorTrashedTicketsFilter,
                {
                    member: 'TicketEnriched.periodStart',
                    operator: 'afterDate',
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: 'TicketEnriched.periodEnd',
                    operator: 'beforeDate',
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: 'TicketCustomFieldsEnriched.customFieldUpdatedDatetime',
                    operator: 'inDateRange',
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
            ],
            order: [['TicketCustomFieldsEnriched.valueString', 'asc']],
        })
    })
})

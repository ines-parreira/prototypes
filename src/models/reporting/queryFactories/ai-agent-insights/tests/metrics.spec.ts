import { OrderDirection } from 'models/api/types'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import { TicketMeasure, TicketMember } from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    AI_AGENT_TICKETS_CHANNELS,
    aiAgentTicketsWithIntentQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    allTicketsForAiAgentTotalCountQueryFactory,
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

    it('aiAgentTouchedTicketTotalCountQueryFactory with intent and outcome field ids', () => {
        const result = aiAgentTouchedTicketTotalCountQueryFactory({
            filters,
            timezone,
            outcomeFieldId: 1,
            intentFieldId: 2,
            customFieldFilter: 'handover',
            sorting: OrderDirection.Asc,
        })
        expect(result).toEqual({
            measures: ['TicketEnriched.ticketCount'],
            dimensions: [],
            timezone: 'UTC',
            segments: [],
            filters: [
                {
                    member: TicketMember.IsTrashed,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.IsSpam,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: TicketMember.TotalCustomFieldIdsToMatch,
                    operator: ReportingFilterOperator.Equals,
                    values: ['2'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: ['2::', '1::handover'],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotStartsWith,
                    values: ['2::Other::No Reply'],
                },
            ],
            order: [[TicketMeasure.TicketCount, 'asc']],
        })
    })

    it('allTicketsForAiAgentTotalCountQueryFactory with intent and outcome field ids', () => {
        const result = allTicketsForAiAgentTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId: 1,
            sorting: OrderDirection.Asc,
        })

        expect(result).toEqual({
            measures: ['TicketEnriched.ticketCount'],
            dimensions: [],
            timezone: 'UTC',
            segments: [],
            filters: [
                {
                    member: TicketMember.IsTrashed,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.IsSpam,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: AI_AGENT_TICKETS_CHANNELS,
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotStartsWith,
                    values: ['1::Other::No Reply'],
                },
            ],
            order: [[TicketMeasure.TicketCount, 'asc']],
        })
    })
})

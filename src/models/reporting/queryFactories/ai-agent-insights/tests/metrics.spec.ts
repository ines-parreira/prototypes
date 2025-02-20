import {OrderDirection} from 'models/api/types'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import {ReportingFilterOperator} from 'models/reporting/types'
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
            customerSatisfactionPerIntentLevelQueryFactory(filters, timezone)
        ).toEqual({
            dimensions: [
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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

    it('customerSatisfactionPerIntentLevelQueryFactory with custom field', () => {
        expect(
            customerSatisfactionPerIntentLevelQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
                1,
                'customFieldValue',
                '1'
            )
        ).toEqual({
            dimensions: [
                TicketCustomFieldsDimension.TicketCustomFieldsValueString,
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
                    member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                    operator: ReportingFilterOperator.StartsWith,
                    values: ['customFieldValue'],
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
            recommendedResourceQueryFactory(filters, timezone, ['1', '2'])
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
})

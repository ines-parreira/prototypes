import {
    AutomatedTicketsFilterMember,
    AutomatedTicketsMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomatedTicketsCube'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesFilterMember,
    RecommendedResourcesMeasure,
} from 'domains/reporting/models/cubes/automate_v2/RecommendedResourcesCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    AiAgentAutomatedInteractionsTicketsQueryFactory,
    aiAgentAutomatedTicketCountQueryFactory,
    aiAgentTicketsWithIntentQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    allTicketsForAiAgentTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { AI_AGENT_TICKETS_CHANNELS } from 'domains/reporting/models/queryFactories/ai-agent-insights/utils'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('AI Agent metrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const intentFieldId = 1
    const outcomeFieldId = 2
    const sorting = OrderDirection.Asc

    it('customerSatisfactionPerIntentLevelQueryFactory', () => {
        expect(
            customerSatisfactionPerIntentLevelQueryFactory({
                filters,
                timezone,
                intentFieldId,
                outcomeFieldId,
                sorting,
            }),
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
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [`${outcomeFieldId}::`],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [
                        `${intentFieldId}::Other::No Reply`,
                        `${intentFieldId}::Other::No Reply::Other`,
                        `${intentFieldId}::Other::Spam::Other`,
                        `${intentFieldId}::Other::Spam`,
                        `${outcomeFieldId}::Close::Without message`,
                    ],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
            ],
            measures: [
                TicketSatisfactionSurveyMeasure.ScoredSurveysCount,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
            ],
            segments: [TicketSatisfactionSurveySegment.SurveyScored],
            timezone: timezone,
            order: [[TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting]],
        })
    })

    it('customerSatisfactionPerIntentLevelQueryFactory with user id', () => {
        expect(
            customerSatisfactionPerIntentLevelQueryFactory({
                filters,
                timezone,
                sorting: OrderDirection.Asc,
                outcomeFieldId,
                intentFieldId,
                assigneeUserId: 1,
            }),
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
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [`${outcomeFieldId}::`],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [
                        `${intentFieldId}::Other::No Reply`,
                        `${intentFieldId}::Other::No Reply::Other`,
                        `${intentFieldId}::Other::Spam::Other`,
                        `${intentFieldId}::Other::Spam`,
                        `${outcomeFieldId}::Close::Without message`,
                    ],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
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
            dimensions: [TicketDimension.TicketId, TicketDimension.CustomField],
            timezone: 'UTC',
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
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
            ],
        })
    })

    it('aiAgentTicketsWithIntentQueryFactory with intent and outcome field ids', () => {
        const result = aiAgentTicketsWithIntentQueryFactory(
            filters,
            timezone,
            intentFieldId,
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
                    values: [`${intentFieldId}::intent1`],
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
            ],
            order: [['TicketCustomFieldsEnriched.valueString', 'asc']],
        })
    })

    it('aiAgentTouchedTicketTotalCountQueryFactory with intent and outcome field ids', () => {
        const result = aiAgentTouchedTicketTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId: intentFieldId,
            outcomeFieldId: outcomeFieldId,
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
                    values: ['1'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [`${outcomeFieldId}::handover`],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [
                        `${intentFieldId}::Other::No Reply`,
                        `${intentFieldId}::Other::No Reply::Other`,
                        `${intentFieldId}::Other::Spam::Other`,
                        `${intentFieldId}::Other::Spam`,
                        `${outcomeFieldId}::Close::Without message`,
                    ],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
            ],
            order: [[TicketMeasure.TicketCount, 'asc']],
        })
    })

    it('allTicketsForAiAgentTotalCountQueryFactory with intent and outcome field ids', () => {
        const result = allTicketsForAiAgentTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId: intentFieldId,
            outcomeFieldId: outcomeFieldId,
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
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        formatReportingQueryDate(filters.period.start_datetime),
                        formatReportingQueryDate(filters.period.end_datetime),
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [
                        `${intentFieldId}::Other::No Reply`,
                        `${intentFieldId}::Other::No Reply::Other`,
                        `${intentFieldId}::Other::Spam::Other`,
                        `${intentFieldId}::Other::Spam`,
                        `${outcomeFieldId}::Close::Without message`,
                    ],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
            ],
            order: [[TicketMeasure.TicketCount, 'asc']],
        })
    })

    it('aiAgentAutomatedTicketCountQueryFactory without ticketIds', () => {
        const result = aiAgentAutomatedTicketCountQueryFactory({
            filters,
            timezone: 'UTC',
            ticketIds: [],
            sorting: OrderDirection.Asc,
        })
        expect(result).toEqual({
            measures: [AutomatedTicketsMeasure.NumAutomatedTickets],
            dimensions: [],
            timezone: 'UTC',
            filters: [
                {
                    member: AutomatedTicketsFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: AutomatedTicketsFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: AutomatedTicketsFilterMember.TicketId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['0'],
                },
            ],
            order: [[AutomatedTicketsMeasure.NumAutomatedTickets, 'asc']],
        })
    })

    it('aiAgentAutomatedTicketCountQueryFactory with ticketIds', () => {
        const result = aiAgentAutomatedTicketCountQueryFactory({
            filters,
            timezone: 'UTC',
            ticketIds: ['1', '2'],
            sorting: OrderDirection.Desc,
        })
        expect(result).toEqual({
            measures: [AutomatedTicketsMeasure.NumAutomatedTickets],
            dimensions: [],
            timezone: 'UTC',
            filters: [
                {
                    member: AutomatedTicketsFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: AutomatedTicketsFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: AutomatedTicketsFilterMember.TicketId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1', '2'],
                },
            ],
            order: [[AutomatedTicketsMeasure.NumAutomatedTickets, 'desc']],
        })
    })

    it('aiAgentAutomatedTicketCountQueryFactory without sorting', () => {
        const result = aiAgentAutomatedTicketCountQueryFactory({
            filters,
            timezone: 'UTC',
            ticketIds: ['1', '2'],
        })
        expect(result).toEqual({
            measures: [AutomatedTicketsMeasure.NumAutomatedTickets],
            dimensions: [],
            timezone: 'UTC',
            filters: [
                {
                    member: AutomatedTicketsFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: AutomatedTicketsFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
                {
                    member: AutomatedTicketsFilterMember.TicketId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1', '2'],
                },
            ],
        })
    })

    it(' AiAgentAutomatedInteractionsTicketsQueryFactory query with the given filters, timezone, and sorting', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00.000',
                end_datetime: '2021-01-02T00:00:00.000',
            },
        }
        const timezone = 'UTC'
        const sorting = OrderDirection.Asc
        const integrationIds = ['integration1', 'integration2']

        const result = AiAgentAutomatedInteractionsTicketsQueryFactory({
            filters,
            timezone,
            outcomeFieldId,
            intentFieldId,
            sorting,
            integrationIds,
        })

        expect(result).toEqual({
            measures: [],
            dimensions: [TicketDimension.TicketId],
            timezone: 'UTC',
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    filters,
                ),
                {
                    member: TicketMember.TotalCustomFieldIdsToMatch,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: TicketMember.CustomField,
                    operator: ReportingFilterOperator.StartsWith,
                    values: [`${outcomeFieldId}::`],
                },
                {
                    member: TicketMember.CreatedDatetime,
                    operator: ReportingFilterOperator.InDateRange,
                    values: [
                        '2021-01-01T00:00:00.000',
                        '2021-01-02T00:00:00.000',
                    ],
                },
                {
                    member: TicketMember.CustomFieldToExclude,
                    operator: ReportingFilterOperator.NotEquals,
                    values: [
                        `${intentFieldId}::Other::No Reply`,
                        `${intentFieldId}::Other::No Reply::Other`,
                        `${intentFieldId}::Other::Spam::Other`,
                        `${intentFieldId}::Other::Spam`,
                    ],
                },
                {
                    member: TicketMessagesMember.IntegrationChannelPair,
                    operator: ReportingFilterOperator.Equals,
                    values: ['integration1', 'integration2'],
                },
            ],
            order: [[TicketMeasure.TicketCount, 'asc']],
        })
    })
})

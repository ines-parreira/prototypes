import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    HandoverInteractionsDimension,
    HandoverInteractionsFilterMember,
} from 'domains/reporting/models/cubes/ai-agent/HandoverInteractionsCube'
import {
    AiSalesAgentActivityDimension,
    AiSalesAgentActivityFilterMember,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentActivity'
import {
    AiSalesAgentOrdersPerformanceDimension,
    AiSalesAgentOrdersPerformanceFilterMember,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersPerformance'
import {
    AIAgentAutomatedInteractionsV2Dimension,
    AIAgentAutomatedInteractionsV2FilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import {
    AIAgentCSATDimension,
    AIAgentCSATFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentCSATCube'
import {
    AIAgentDecreaseInFRTDimension,
    AIAgentDecreaseInFRTFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentDecreaseInFRTCube'
import {
    AIAgentDecreaseInResolutionTimeDimension,
    AIAgentDecreaseInResolutionTimeFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentDecreaseInResolutionTimeCube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    allAgentsAutomatedInteractionsDrillDownQueryFactory,
    allAgentsClosedTicketsDrillDownQueryFactory,
    allAgentsCsatDrillDownQueryFactory,
    allAgentsFRTDrillDownQueryFactory,
    allAgentsHandoverInteractionsDrillDownQueryFactory,
    allAgentsResolutionTimeDrillDownQueryFactory,
    shoppingAssistantAutomatedInteractionsDrillDownQueryFactory,
    shoppingAssistantHandoverInteractionsDrillDownQueryFactory,
    shoppingAssistantOrdersInfluencedDrillDownQueryFactory,
    shoppingAssistantProductRecommendationsDrillDownQueryFactory,
    supportAgentAutomatedInteractionsDrillDownQueryFactory,
    supportAgentCsatDrillDownQueryFactory,
    supportAgentFRTDrillDownQueryFactory,
    supportAgentHandoverInteractionsDrillDownQueryFactory,
    supportAgentResolutionTimeDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const timezone = 'UTC'

const filters: StatsFilters = {
    channels: withDefaultLogicalOperator(['chat']),
    stores: withDefaultLogicalOperator([122]),
    period: {
        start_datetime: '2021-01-01T00:00:00.000',
        end_datetime: '2021-01-02T00:00:00.000',
    },
}

const aiSalesAgentActivityBaseFilters = [
    {
        member: AiSalesAgentActivityFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AiSalesAgentActivityFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
    {
        member: AiSalesAgentActivityFilterMember.StoreIntegrationId,
        operator: ReportingFilterOperator.Equals,
        values: ['122'],
    },
    {
        member: AiSalesAgentActivityFilterMember.Channel,
        operator: ReportingFilterOperator.Equals,
        values: ['chat'],
    },
]

const automatedInteractionsBaseFilters = [
    {
        member: AIAgentAutomatedInteractionsV2FilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AIAgentAutomatedInteractionsV2FilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
    {
        member: AIAgentAutomatedInteractionsV2FilterMember.StoreIntegrationId,
        operator: ReportingFilterOperator.Equals,
        values: ['122'],
    },
    {
        member: AIAgentAutomatedInteractionsV2FilterMember.Channel,
        operator: ReportingFilterOperator.Equals,
        values: ['chat'],
    },
]

const handoverBaseFilters = [
    {
        member: HandoverInteractionsFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: HandoverInteractionsFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
    {
        member: HandoverInteractionsFilterMember.StoreIntegrationId,
        operator: ReportingFilterOperator.Equals,
        values: ['122'],
    },
    {
        member: HandoverInteractionsFilterMember.Channel,
        operator: ReportingFilterOperator.Equals,
        values: ['chat'],
    },
]

describe('allAgentsAutomatedInteractionsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            allAgentsAutomatedInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_ALL_AGENTS_AUTOMATED_INTERACTIONS_DRILL_DOWN,
            measures: [],
            dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
            filters: automatedInteractionsBaseFilters,
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            allAgentsAutomatedInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentAutomatedInteractionsV2Dimension.TicketId,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('shoppingAssistantAutomatedInteractionsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_DRILL_DOWN,
            measures: [],
            dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
            filters: [
                {
                    member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...automatedInteractionsBaseFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentAutomatedInteractionsV2Dimension.TicketId,
                        OrderDirection.Desc,
                    ],
                ],
            }),
        )
    })
})

describe('supportAgentAutomatedInteractionsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            supportAgentAutomatedInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_DRILL_DOWN,
            measures: [],
            dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
            filters: [
                {
                    member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSupport],
                },
                ...automatedInteractionsBaseFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            supportAgentAutomatedInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentAutomatedInteractionsV2Dimension.TicketId,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('allAgentsHandoverInteractionsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            allAgentsHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_ALL_AGENTS_HANDOVER_INTERACTIONS_DRILL_DOWN,
            measures: [],
            dimensions: [HandoverInteractionsDimension.TicketId],
            filters: [
                {
                    member: HandoverInteractionsFilterMember.FeatureType,
                    operator: ReportingFilterOperator.Equals,
                    values: [AutomationFeatureType.AiAgent],
                },
                ...handoverBaseFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            allAgentsHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        HandoverInteractionsDimension.TicketId,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('shoppingAssistantHandoverInteractionsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            shoppingAssistantHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_DRILL_DOWN,
            measures: [],
            dimensions: [HandoverInteractionsDimension.TicketId],
            filters: [
                {
                    member: HandoverInteractionsFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...handoverBaseFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            shoppingAssistantHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        HandoverInteractionsDimension.TicketId,
                        OrderDirection.Desc,
                    ],
                ],
            }),
        )
    })
})

describe('supportAgentHandoverInteractionsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            supportAgentHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_HANDOVER_INTERACTIONS_DRILL_DOWN,
            measures: [],
            dimensions: [HandoverInteractionsDimension.TicketId],
            filters: [
                {
                    member: HandoverInteractionsFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSupport],
                },
                ...handoverBaseFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            supportAgentHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        HandoverInteractionsDimension.TicketId,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('allAgentsClosedTicketsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            allAgentsClosedTicketsDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName: METRIC_NAMES.AI_AGENT_CLOSED_TICKETS_DRILL_DOWN,
            measures: [],
            dimensions: [
                TicketDimension.TicketId,
                TicketDimension.CreatedDatetime,
                TicketDimension.AssigneeUserId,
            ],
            segments: [TicketSegment.ClosedTickets],
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
                    values: [filters.period.start_datetime],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
        })
    })

    it('defaults to desc order by createdDatetime when sorting not provided', () => {
        const result = allAgentsClosedTicketsDrillDownQueryFactory(
            filters,
            timezone,
        )
        expect(result.order).toEqual([
            [TicketDimension.CreatedDatetime, OrderDirection.Desc],
        ])
    })

    it('uses provided sorting direction', () => {
        expect(
            allAgentsClosedTicketsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
            }),
        )
    })

    it('includes assigneeUserId filter when provided', () => {
        expect(
            allAgentsClosedTicketsDrillDownQueryFactory(
                filters,
                timezone,
                undefined,
                789,
            ),
        ).toEqual(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: TicketMember.AssigneeUserId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['789'],
                    },
                ]),
            }),
        )
    })

    it('omits assigneeUserId filter when not provided', () => {
        const result = allAgentsClosedTicketsDrillDownQueryFactory(
            filters,
            timezone,
        )
        const hasAssigneeFilter = result.filters.some(
            (f) => f.member === TicketMember.AssigneeUserId,
        )
        expect(hasAssigneeFilter).toBe(false)
    })

    it('does not include stores filter', () => {
        const result = allAgentsClosedTicketsDrillDownQueryFactory(
            filters,
            timezone,
        )
        expect(result.filters).not.toContainEqual(
            expect.objectContaining({ values: ['122'] }),
        )
    })
})

describe('allAgentsCsatDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(allAgentsCsatDrillDownQueryFactory(filters, timezone)).toEqual({
            metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CSAT_DRILL_DOWN,
            measures: [],
            dimensions: [
                AIAgentCSATDimension.TicketId,
                AIAgentCSATDimension.SurveyScore,
            ],
            filters: [
                {
                    member: AIAgentCSATFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: AIAgentCSATFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: AIAgentCSATFilterMember.StoreIntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['122'],
                },
                {
                    member: AIAgentCSATFilterMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
                {
                    member: AIAgentCSATFilterMember.SurveyScore,
                    operator: ReportingFilterOperator.Gte,
                    values: ['1'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            allAgentsCsatDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [AIAgentCSATDimension.SurveyScore, OrderDirection.Desc],
                ],
            }),
        )
    })

    it('includes outcomeCustomFieldId filter when provided', () => {
        expect(
            allAgentsCsatDrillDownQueryFactory(
                filters,
                timezone,
                undefined,
                123,
            ),
        ).toEqual(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: AIAgentCSATFilterMember.AiAgentOutcomeCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['123'],
                    },
                ]),
            }),
        )
    })
})

describe('supportAgentCsatDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            supportAgentCsatDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_CSAT_DRILL_DOWN,
            measures: [],
            dimensions: [
                AIAgentCSATDimension.TicketId,
                AIAgentCSATDimension.SurveyScore,
            ],
            filters: [
                {
                    member: AIAgentCSATFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSupport],
                },
                {
                    member: AIAgentCSATFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: AIAgentCSATFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: AIAgentCSATFilterMember.StoreIntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['122'],
                },
                {
                    member: AIAgentCSATFilterMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
                {
                    member: AIAgentCSATFilterMember.SurveyScore,
                    operator: ReportingFilterOperator.Gte,
                    values: ['1'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            supportAgentCsatDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [AIAgentCSATDimension.SurveyScore, OrderDirection.Desc],
                ],
            }),
        )
    })

    it('includes outcomeCustomFieldId filter when provided', () => {
        expect(
            supportAgentCsatDrillDownQueryFactory(
                filters,
                timezone,
                undefined,
                123,
            ),
        ).toEqual(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: AIAgentCSATFilterMember.AiAgentOutcomeCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['123'],
                    },
                ]),
            }),
        )
    })
})

describe('allAgentsFRTDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(allAgentsFRTDrillDownQueryFactory(filters, timezone)).toEqual({
            metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_FRT_DRILL_DOWN,
            measures: [],
            dimensions: [
                AIAgentDecreaseInFRTDimension.TicketId,
                AIAgentDecreaseInFRTDimension.FirstResponseTime,
            ],
            filters: [
                {
                    member: AIAgentDecreaseInFRTFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: AIAgentDecreaseInFRTFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: AIAgentDecreaseInFRTFilterMember.StoreIntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['122'],
                },
                {
                    member: AIAgentDecreaseInFRTFilterMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            allAgentsFRTDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentDecreaseInFRTDimension.FirstResponseTime,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('supportAgentFRTDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(supportAgentFRTDrillDownQueryFactory(filters, timezone)).toEqual(
            {
                metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_FRT_DRILL_DOWN,
                measures: [],
                dimensions: [
                    AIAgentDecreaseInFRTDimension.TicketId,
                    AIAgentDecreaseInFRTDimension.FirstResponseTime,
                ],
                filters: [
                    {
                        member: AIAgentDecreaseInFRTFilterMember.AiAgentRole,
                        operator: ReportingFilterOperator.Equals,
                        values: [AIAgentSkills.AIAgentSupport],
                    },
                    {
                        member: AIAgentDecreaseInFRTFilterMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [filters.period.start_datetime],
                    },
                    {
                        member: AIAgentDecreaseInFRTFilterMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [filters.period.end_datetime],
                    },
                    {
                        member: AIAgentDecreaseInFRTFilterMember.StoreIntegrationId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['122'],
                    },
                    {
                        member: AIAgentDecreaseInFRTFilterMember.Channel,
                        operator: ReportingFilterOperator.Equals,
                        values: ['chat'],
                    },
                ],
                timezone,
                limit: DRILLDOWN_QUERY_LIMIT,
                order: [],
            },
        )
    })

    it('includes sorting when provided', () => {
        expect(
            supportAgentFRTDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentDecreaseInFRTDimension.FirstResponseTime,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('allAgentsResolutionTimeDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            allAgentsResolutionTimeDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_ALL_AGENTS_RESOLUTION_TIME_DRILL_DOWN,
            measures: [],
            dimensions: [
                AIAgentDecreaseInResolutionTimeDimension.TicketId,
                AIAgentDecreaseInResolutionTimeDimension.ResolutionTime,
            ],
            filters: [
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.StoreIntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['122'],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            allAgentsResolutionTimeDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentDecreaseInResolutionTimeDimension.TicketId,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

describe('supportAgentResolutionTimeDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            supportAgentResolutionTimeDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_RESOLUTION_TIME_DRILL_DOWN,
            measures: [],
            dimensions: [
                AIAgentDecreaseInResolutionTimeDimension.TicketId,
                AIAgentDecreaseInResolutionTimeDimension.ResolutionTime,
            ],
            filters: [
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.AiAgentRole,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSupport],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.StoreIntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['122'],
                },
                {
                    member: AIAgentDecreaseInResolutionTimeFilterMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting when provided', () => {
        expect(
            supportAgentResolutionTimeDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AIAgentDecreaseInResolutionTimeDimension.TicketId,
                        OrderDirection.Desc,
                    ],
                ],
            }),
        )
    })
})

describe('shoppingAssistantProductRecommendationsDrillDownQueryFactory', () => {
    it('returns correct query', () => {
        expect(
            shoppingAssistantProductRecommendationsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_PRODUCT_RECOMMENDATIONS_DRILL_DOWN,
            measures: [],
            dimensions: [
                AiSalesAgentActivityDimension.TicketId,
                AiSalesAgentActivityDimension.ProductRecommended,
                AiSalesAgentActivityDimension.StoreIntegrationId,
                AiSalesAgentActivityDimension.ProductVariantIds,
            ],
            filters: [
                {
                    member: AiSalesAgentActivityFilterMember.ProductRecommended,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                ...aiSalesAgentActivityBaseFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('excludes null productRecommended values', () => {
        expect(
            shoppingAssistantProductRecommendationsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual(
            expect.objectContaining({
                filters: expect.arrayContaining([
                    {
                        member: AiSalesAgentActivityFilterMember.ProductRecommended,
                        operator: ReportingFilterOperator.Set,
                        values: [],
                    },
                ]),
            }),
        )
    })

    it('includes sorting when provided', () => {
        expect(
            shoppingAssistantProductRecommendationsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AiSalesAgentActivityDimension.TicketId,
                        OrderDirection.Desc,
                    ],
                ],
            }),
        )
    })
})

describe('shoppingAssistantOrdersInfluencedDrillDownQueryFactory', () => {
    it('should build a query with correct structure', () => {
        expect(
            shoppingAssistantOrdersInfluencedDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_ORDERS_INFLUENCED_DRILL_DOWN,
            measures: [],
            dimensions: [
                AiSalesAgentOrdersPerformanceDimension.TicketId,
                AiSalesAgentOrdersPerformanceDimension.OrderId,
                AiSalesAgentOrdersPerformanceDimension.TotalAmount,
            ],
            filters: [
                {
                    member: AiSalesAgentOrdersPerformanceFilterMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: AiSalesAgentOrdersPerformanceFilterMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
                {
                    member: AiSalesAgentOrdersPerformanceFilterMember.StoreIntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['122'],
                },
                {
                    member: AiSalesAgentOrdersPerformanceFilterMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['chat'],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('should build a query with sorting', () => {
        expect(
            shoppingAssistantOrdersInfluencedDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Asc,
            ),
        ).toEqual(
            expect.objectContaining({
                order: [
                    [
                        AiSalesAgentOrdersPerformanceDimension.TicketId,
                        OrderDirection.Asc,
                    ],
                ],
            }),
        )
    })
})

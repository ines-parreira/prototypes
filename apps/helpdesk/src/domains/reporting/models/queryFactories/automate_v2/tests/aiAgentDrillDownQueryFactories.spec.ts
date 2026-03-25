import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AIAgentAutomatedInteractionsV2Dimension,
    AIAgentAutomatedInteractionsV2FilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import { AIAgentClosedTicketsDimension } from 'domains/reporting/models/cubes/automate_v2/AIAgentClosedTicketsCube'
import {
    AIAgentCSATDimension,
    AIAgentCSATFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentCSATCube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { HandoverInteractionsFilterMember } from 'domains/reporting/models/cubes/automate_v2/HandoverInteractionsCube'
import {
    allAgentsAutomatedInteractionsDrillDownQueryFactory,
    allAgentsClosedTicketsDrillDownQueryFactory,
    allAgentsCsatDrillDownQueryFactory,
    allAgentsHandoverInteractionsDrillDownQueryFactory,
    shoppingAssistantAutomatedInteractionsDrillDownQueryFactory,
    shoppingAssistantHandoverInteractionsDrillDownQueryFactory,
    supportAgentAutomatedInteractionsDrillDownQueryFactory,
    supportAgentCsatDrillDownQueryFactory,
    supportAgentHandoverInteractionsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000Z',
        end_datetime: '2024-01-31T23:59:59.999Z',
    },
}

describe('allAgentsAutomatedInteractionsDrillDownQueryFactory', () => {
    it('should return correct metricName', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_ALL_AGENTS_AUTOMATED_INTERACTIONS_DRILLDOWN,
        )
    })

    it('should include TicketId in dimensions', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.dimensions).toContain(
            AIAgentAutomatedInteractionsV2Dimension.TicketId,
        )
    })

    it('should have empty measures', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.measures).toEqual([])
    })

    it('should include periodStart filter with AfterDate operator', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        const periodStartFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.PeriodStart,
        )
        expect(periodStartFilter).toBeDefined()
        if (periodStartFilter && 'operator' in periodStartFilter) {
            expect(periodStartFilter.operator).toBe(
                ReportingFilterOperator.AfterDate,
            )
            expect(periodStartFilter.values).toEqual([
                mockFilters.period.start_datetime,
            ])
        }
    })

    it('should include periodEnd filter with BeforeDate operator', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        const periodEndFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.PeriodEnd,
        )
        expect(periodEndFilter).toBeDefined()
        if (periodEndFilter && 'operator' in periodEndFilter) {
            expect(periodEndFilter.operator).toBe(
                ReportingFilterOperator.BeforeDate,
            )
            expect(periodEndFilter.values).toEqual([
                mockFilters.period.end_datetime,
            ])
        }
    })

    it('should set correct limit', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.limit).toBe(DRILLDOWN_QUERY_LIMIT)
    })

    it('should set empty order when no sorting provided', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.order).toEqual([])
    })

    it('should set order when sorting is provided', () => {
        const result = allAgentsAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
            OrderDirection.Asc,
        )
        expect(result.order).toEqual([
            [
                AIAgentAutomatedInteractionsV2Dimension.TicketId,
                OrderDirection.Asc,
            ],
        ])
    })
})

describe('shoppingAssistantAutomatedInteractionsDrillDownQueryFactory', () => {
    it('should return correct metricName', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_DRILLDOWN,
        )
    })

    it('should include TicketId in dimensions', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        expect(result.dimensions).toContain(
            AIAgentAutomatedInteractionsV2Dimension.TicketId,
        )
    })

    it('should include aiAgentSkill filter with AIAgentSales value', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        const skillFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.AiAgentSkill,
        )
        expect(skillFilter).toBeDefined()
        if (skillFilter && 'operator' in skillFilter) {
            expect(skillFilter.operator).toBe(ReportingFilterOperator.Equals)
            expect(skillFilter.values).toEqual([AIAgentSkills.AIAgentSales])
        }
    })

    it('should include periodStart filter with AfterDate operator', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        const periodStartFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.PeriodStart,
        )
        expect(periodStartFilter).toBeDefined()
        if (periodStartFilter && 'operator' in periodStartFilter) {
            expect(periodStartFilter.operator).toBe(
                ReportingFilterOperator.AfterDate,
            )
            expect(periodStartFilter.values).toEqual([
                mockFilters.period.start_datetime,
            ])
        }
    })

    it('should include periodEnd filter with BeforeDate operator', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        const periodEndFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.PeriodEnd,
        )
        expect(periodEndFilter).toBeDefined()
        if (periodEndFilter && 'operator' in periodEndFilter) {
            expect(periodEndFilter.operator).toBe(
                ReportingFilterOperator.BeforeDate,
            )
            expect(periodEndFilter.values).toEqual([
                mockFilters.period.end_datetime,
            ])
        }
    })

    it('should set correct limit', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        expect(result.limit).toBe(DRILLDOWN_QUERY_LIMIT)
    })

    it('should set empty order when no sorting provided', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
            )
        expect(result.order).toEqual([])
    })

    it('should set order when sorting is provided', () => {
        const result =
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactory(
                mockFilters,
                'UTC',
                OrderDirection.Desc,
            )
        expect(result.order).toEqual([
            [
                AIAgentAutomatedInteractionsV2Dimension.TicketId,
                OrderDirection.Desc,
            ],
        ])
    })
})

describe('supportAgentAutomatedInteractionsDrillDownQueryFactory', () => {
    it('should return correct metricName', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_DRILLDOWN,
        )
    })

    it('should include TicketId in dimensions', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.dimensions).toContain(
            AIAgentAutomatedInteractionsV2Dimension.TicketId,
        )
    })

    it('should include aiAgentSkill filter with AIAgentSupport value', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        const skillFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.AiAgentSkill,
        )
        expect(skillFilter).toBeDefined()
        if (skillFilter && 'operator' in skillFilter) {
            expect(skillFilter.operator).toBe(ReportingFilterOperator.Equals)
            expect(skillFilter.values).toEqual([AIAgentSkills.AIAgentSupport])
        }
    })

    it('should include period filters', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        const periodStartFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.PeriodStart,
        )
        const periodEndFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member ===
                    AIAgentAutomatedInteractionsV2FilterMember.PeriodEnd,
        )
        expect(periodStartFilter).toBeDefined()
        expect(periodEndFilter).toBeDefined()
    })

    it('should set correct limit', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.limit).toBe(DRILLDOWN_QUERY_LIMIT)
    })

    it('should set empty order when no sorting provided', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
        )
        expect(result.order).toEqual([])
    })

    it('should set order when sorting is provided', () => {
        const result = supportAgentAutomatedInteractionsDrillDownQueryFactory(
            mockFilters,
            'UTC',
            OrderDirection.Asc,
        )
        expect(result.order).toEqual([
            [
                AIAgentAutomatedInteractionsV2Dimension.TicketId,
                OrderDirection.Asc,
            ],
        ])
    })
})

const timezone = 'UTC'
const filters: StatsFilters = {
    channels: withDefaultLogicalOperator(['chat']),
    period: {
        start_datetime: '2021-01-01T00:00:00Z',
        end_datetime: '2021-01-02T00:00:00Z',
    },
}

const periodFilters = [
    {
        member: 'HandoverInteractions.periodStart',
        operator: 'afterDate',
        values: ['2021-01-01T00:00:00Z'],
    },
    {
        member: 'HandoverInteractions.periodEnd',
        operator: 'beforeDate',
        values: ['2021-01-02T00:00:00Z'],
    },
]

describe('allAgentsHandoverInteractionsDrillDownQueryFactory', () => {
    it('returns query with automationFeatureType filter and period filters', () => {
        expect(
            allAgentsHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_ALL_AGENTS_HANDOVER_INTERACTIONS_DRILLDOWN,
            measures: [],
            dimensions: ['HandoverInteractions.ticketId'],
            filters: [
                {
                    member: HandoverInteractionsFilterMember.FeatureType,
                    operator: ReportingFilterOperator.Equals,
                    values: [AutomationFeatureType.AiAgent],
                },
                ...periodFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting order when sorting is provided', () => {
        const result = allAgentsHandoverInteractionsDrillDownQueryFactory(
            filters,
            timezone,
            OrderDirection.Asc,
        )
        expect(result.order).toEqual([
            ['HandoverInteractions.ticketId', OrderDirection.Asc],
        ])
    })
})

describe('shoppingAssistantHandoverInteractionsDrillDownQueryFactory', () => {
    it('returns query with AIAgentSales skill filter and period filters', () => {
        expect(
            shoppingAssistantHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_DRILLDOWN,
            measures: [],
            dimensions: ['HandoverInteractions.ticketId'],
            filters: [
                {
                    member: 'HandoverInteractions.aiAgentSkill',
                    operator: 'equals',
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...periodFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting order when sorting is provided', () => {
        const result =
            shoppingAssistantHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            )
        expect(result.order).toEqual([
            ['HandoverInteractions.ticketId', OrderDirection.Desc],
        ])
    })
})

describe('supportAgentHandoverInteractionsDrillDownQueryFactory', () => {
    it('returns query with AIAgentSupport skill filter and period filters', () => {
        expect(
            supportAgentHandoverInteractionsDrillDownQueryFactory(
                filters,
                timezone,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_HANDOVER_INTERACTIONS_DRILLDOWN,
            measures: [],
            dimensions: ['HandoverInteractions.ticketId'],
            filters: [
                {
                    member: 'HandoverInteractions.aiAgentSkill',
                    operator: 'equals',
                    values: [AIAgentSkills.AIAgentSupport],
                },
                ...periodFilters,
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('includes sorting order when sorting is provided', () => {
        const result = supportAgentHandoverInteractionsDrillDownQueryFactory(
            filters,
            timezone,
            OrderDirection.Asc,
        )
        expect(result.order).toEqual([
            ['HandoverInteractions.ticketId', OrderDirection.Asc],
        ])
    })
})

describe('allAgentsClosedTicketsDrillDownQueryFactory', () => {
    it('should build a query', () => {
        expect(
            allAgentsClosedTicketsDrillDownQueryFactory(filters, timezone),
        ).toEqual({
            metricName: METRIC_NAMES.AI_AGENT_CLOSED_TICKETS_DRILLDOWN,
            measures: [],
            dimensions: [AIAgentClosedTicketsDimension.TicketId],
            filters: [
                {
                    member: 'AIAgentClosedTickets.periodStart',
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: 'AIAgentClosedTickets.periodEnd',
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
        })
    })

    it('should build a query with sorting', () => {
        expect(
            allAgentsClosedTicketsDrillDownQueryFactory(
                filters,
                timezone,
                OrderDirection.Desc,
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_AGENT_CLOSED_TICKETS_DRILLDOWN,
            measures: [],
            dimensions: [AIAgentClosedTicketsDimension.TicketId],
            filters: [
                {
                    member: 'AIAgentClosedTickets.periodStart',
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.period.start_datetime],
                },
                {
                    member: 'AIAgentClosedTickets.periodEnd',
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [filters.period.end_datetime],
                },
            ],
            timezone,
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [AIAgentClosedTicketsDimension.TicketId, OrderDirection.Desc],
            ],
        })
    })
})

describe('allAgentsCsatDrillDownQueryFactory', () => {
    it('should return correct metricName', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_ALL_AGENTS_CSAT_DRILL_DOWN,
        )
    })

    it('should include TicketId and SurveyScore in dimensions', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.dimensions).toContain(AIAgentCSATDimension.TicketId)
        expect(result.dimensions).toContain(AIAgentCSATDimension.SurveyScore)
    })

    it('should have empty measures', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.measures).toEqual([])
    })

    it('should include periodStart filter with AfterDate operator', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        const periodStartFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member === AIAgentCSATFilterMember.PeriodStart,
        )
        expect(periodStartFilter).toBeDefined()
        if (periodStartFilter && 'operator' in periodStartFilter) {
            expect(periodStartFilter.operator).toBe(
                ReportingFilterOperator.AfterDate,
            )
            expect(periodStartFilter.values).toEqual([
                mockFilters.period.start_datetime,
            ])
        }
    })

    it('should include periodEnd filter with BeforeDate operator', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        const periodEndFilter = result.filters?.find(
            (f) =>
                'member' in f && f.member === AIAgentCSATFilterMember.PeriodEnd,
        )
        expect(periodEndFilter).toBeDefined()
        if (periodEndFilter && 'operator' in periodEndFilter) {
            expect(periodEndFilter.operator).toBe(
                ReportingFilterOperator.BeforeDate,
            )
            expect(periodEndFilter.values).toEqual([
                mockFilters.period.end_datetime,
            ])
        }
    })

    it('should set correct limit', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.limit).toBe(DRILLDOWN_QUERY_LIMIT)
    })

    it('should set empty order when no sorting provided', () => {
        const result = allAgentsCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.order).toEqual([])
    })

    it('should set order when sorting is provided', () => {
        const result = allAgentsCsatDrillDownQueryFactory(
            mockFilters,
            'UTC',
            OrderDirection.Desc,
        )
        expect(result.order).toEqual([
            [AIAgentCSATDimension.SurveyScore, OrderDirection.Desc],
        ])
    })
})

describe('supportAgentCsatDrillDownQueryFactory', () => {
    it('should return correct metricName', () => {
        const result = supportAgentCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_CSAT_DRILL_DOWN,
        )
    })

    it('should include TicketId and SurveyScore in dimensions', () => {
        const result = supportAgentCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.dimensions).toContain(AIAgentCSATDimension.TicketId)
        expect(result.dimensions).toContain(AIAgentCSATDimension.SurveyScore)
    })

    it('should set correct limit', () => {
        const result = supportAgentCsatDrillDownQueryFactory(mockFilters, 'UTC')
        expect(result.limit).toBe(DRILLDOWN_QUERY_LIMIT)
    })

    it('should include aiAgentRole fixed filter for support agent', () => {
        const result = supportAgentCsatDrillDownQueryFactory(mockFilters, 'UTC')
        const roleFilter = result.filters?.find(
            (f) =>
                'member' in f &&
                f.member === AIAgentCSATFilterMember.AiAgentRole,
        )
        expect(roleFilter).toEqual({
            member: AIAgentCSATFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        })
    })

    it('should set order when sorting is provided', () => {
        const result = supportAgentCsatDrillDownQueryFactory(
            mockFilters,
            'UTC',
            OrderDirection.Desc,
        )
        expect(result.order).toEqual([
            [AIAgentCSATDimension.SurveyScore, OrderDirection.Desc],
        ])
    })
})

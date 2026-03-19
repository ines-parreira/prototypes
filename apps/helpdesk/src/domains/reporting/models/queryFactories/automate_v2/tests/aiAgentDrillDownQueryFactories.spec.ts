import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AIAgentAutomatedInteractionsV2Dimension,
    AIAgentAutomatedInteractionsV2FilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    allAgentsAutomatedInteractionsDrillDownQueryFactory,
    shoppingAssistantAutomatedInteractionsDrillDownQueryFactory,
    supportAgentAutomatedInteractionsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories'
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

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsFilterMember,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import {
    handoverInteractionsFromConversationsPerChannelQueryFactory,
    ordersInfluencedPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/shoppingAssistantChannelMetrics'
import { ReportingFilterOperator } from 'domains/reporting/models/types'

describe('Shopping Assistant Channel Metrics Query Factories', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2024-01-01T00:00:00Z',
            end_datetime: '2024-01-31T00:00:00Z',
        },
    }

    describe('handoverInteractionsFromConversationsPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result =
                handoverInteractionsFromConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                )

            expect(result).toMatchObject({
                measures: [AiSalesAgentConversationsMeasure.Count],
                dimensions: [AiSalesAgentConversationsDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_SALES_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_PER_CHANNEL,
            })
        })

        it('should include IsSalesOpportunity filter', () => {
            const result =
                handoverInteractionsFromConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            })
        })

        it('should filter for handover outcome', () => {
            const result =
                handoverInteractionsFromConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsFilterMember.Outcome,
                operator: ReportingFilterOperator.Equals,
                values: ['handover'],
            })
        })

        it('should include Shopping Assistant source filter', () => {
            const result =
                handoverInteractionsFromConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should include date filters from StatsFilters', () => {
            const result =
                handoverInteractionsFromConversationsPerChannelQueryFactory(
                    filters,
                    timezone,
                )

            expect(result.filters.length).toBeGreaterThan(3)
        })
    })

    describe('ordersInfluencedPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = ordersInfluencedPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result).toMatchObject({
                measures: [AiSalesAgentOrdersMeasure.Count],
                dimensions: [AiSalesAgentOrdersDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_SALES_AGENT_SHOPPING_ASSISTANT_ORDERS_INFLUENCED_PER_CHANNEL,
            })
        })

        it('should include IsInfluenced filter', () => {
            const result = ordersInfluencedPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            })
        })

        it('should include Shopping Assistant source filter', () => {
            const result = ordersInfluencedPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should include date filters from StatsFilters', () => {
            const result = ordersInfluencedPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters.length).toBeGreaterThan(2)
        })
    })
})

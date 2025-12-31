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
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    automatedSalesConversationsPerChannelQueryFactory,
    gmvInfluencedPerChannelQueryFactory,
    handoverInteractionsPerChannelQueryFactory,
    snoozedInteractionsPerChannelQueryFactory,
    totalSalesConversationsPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/channelMetrics'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import { ReportingFilterOperator } from 'domains/reporting/models/types'

describe('Channel Metrics Query Factories', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
    }
    const outcomeCustomFieldId = 5254

    describe('handoverInteractionsPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = handoverInteractionsPerChannelQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
            )

            expect(result).toMatchObject({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [TicketDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_CHANNEL,
            })

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(outcomeCustomFieldId)],
            })

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.StartsWith,
                values: ['Handover::'],
            })
        })

        it('should include date filters from StatsFilters', () => {
            const result = handoverInteractionsPerChannelQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
            )

            expect(result.filters.length).toBeGreaterThan(2)
        })
    })

    describe('snoozedInteractionsPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = snoozedInteractionsPerChannelQueryFactory(
                filters,
                timezone,
                outcomeCustomFieldId,
            )

            expect(result).toMatchObject({
                measures: [
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                ],
                dimensions: [TicketDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_AGENT_SNOOZED_INTERACTIONS_PER_CHANNEL,
            })

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [String(outcomeCustomFieldId)],
            })

            expect(result.filters).toContainEqual({
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.StartsWith,
                values: ['Snooze::'],
            })
        })
    })

    describe('gmvInfluencedPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = gmvInfluencedPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result).toMatchObject({
                measures: [AiSalesAgentOrdersMeasure.GmvUsd],
                dimensions: [AiSalesAgentOrdersDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED_PER_CHANNEL,
            })

            expect(result.filters).toContainEqual({
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            })
        })

        it('should include Shopping Assistant source filter', () => {
            const result = gmvInfluencedPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.ShoppingAssistant],
            })
        })
    })

    describe('totalSalesConversationsPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = totalSalesConversationsPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result).toMatchObject({
                measures: [AiSalesAgentConversationsMeasure.Count],
                dimensions: [AiSalesAgentConversationsDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_SALES_AGENT_TOTAL_SALES_CONVERSATIONS_PER_CHANNEL,
            })

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            })
        })

        it('should include Shopping Assistant source filter', () => {
            const result = totalSalesConversationsPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.ShoppingAssistant],
            })
        })
    })

    describe('automatedSalesConversationsPerChannelQueryFactory', () => {
        it('should return correct query structure', () => {
            const result = automatedSalesConversationsPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result).toMatchObject({
                measures: [AiSalesAgentConversationsMeasure.Count],
                dimensions: [AiSalesAgentConversationsDimension.Channel],
                timezone,
                metricName:
                    METRIC_NAMES.AI_SALES_AGENT_AUTOMATED_SALES_CONVERSATIONS_PER_CHANNEL,
            })

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            })
        })

        it('should exclude handover conversations', () => {
            const result = automatedSalesConversationsPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsFilterMember.Outcome,
                operator: ReportingFilterOperator.NotEquals,
                values: ['handover'],
            })
        })

        it('should include Shopping Assistant source filter', () => {
            const result = automatedSalesConversationsPerChannelQueryFactory(
                filters,
                timezone,
            )

            expect(result.filters).toContainEqual({
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: [SourceFilter.ShoppingAssistant],
            })
        })
    })
})

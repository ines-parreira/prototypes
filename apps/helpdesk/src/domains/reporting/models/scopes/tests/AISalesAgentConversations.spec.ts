import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import {
    AISalesAgentAutomatedSalesConversationsPerChannel,
    AISalesAgentAutomatedSalesConversationsPerChannelQueryFactoryV2,
    AISalesAgentDiscountCodesOffered,
    AISalesAgentDiscountCodesOfferedQueryFactoryV2,
    AISalesAgentGroupedSalesOpportunity,
    AISalesAgentGroupedSalesOpportunityQueryFactoryV2,
    AISalesAgentProductRecommendationsCount,
    AISalesAgentProductRecommendationsCountQueryFactoryV2,
    AISalesAgentTotalNumberOfAutomatedSales,
    AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2,
    AISalesAgentTotalNumberOfSalesConversations,
    AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2,
    AISalesAgentTotalProductRecommendations,
    AISalesAgentTotalProductRecommendationsQueryFactoryV2,
    AISalesAgentTotalSalesConversationsPerChannel,
    AISalesAgentTotalSalesConversationsPerChannelQueryFactoryV2,
} from 'domains/reporting/models/scopes/AISalesAgentConversations'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'

describe('AISalesAgentConversations scope', () => {
    const mockFilters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2025-09-22T00:00:00',
            end_datetime: '2025-09-22T23:59:59',
        },
    }

    const mockContext = {
        timezone: 'UTC',
        filters: mockFilters,
    }

    describe('AISalesAgentTotalSalesConversationsPerChannel', () => {
        it('should build query with count measure and channel dimension', () => {
            const result =
                AISalesAgentTotalSalesConversationsPerChannel.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.dimensions).toEqual(['channel'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentTotalSalesConversationsPerChannelQueryFactoryV2(
                    mockContext,
                )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_SALES_CONVERSATIONS_PER_CHANNEL,
            )
        })
    })

    describe('AISalesAgentAutomatedSalesConversationsPerChannel', () => {
        it('should build query with outcome NOT handover filter', () => {
            const result =
                AISalesAgentAutomatedSalesConversationsPerChannel.build(
                    mockContext,
                )

            expect(result.measures).toEqual(['count'])
            expect(result.dimensions).toEqual(['channel'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'outcome',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['handover'],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentAutomatedSalesConversationsPerChannelQueryFactoryV2(
                    mockContext,
                )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_AUTOMATED_SALES_CONVERSATIONS_PER_CHANNEL,
            )
        })
    })

    describe('AISalesAgentProductRecommendationsCount', () => {
        it('should build query with productId dimension and SET operator', () => {
            const result =
                AISalesAgentProductRecommendationsCount.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.dimensions).toEqual(['productId'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'productId',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should include order and limit', () => {
            const result =
                AISalesAgentProductRecommendationsCount.build(mockContext)

            expect(result.order).toEqual([['count', 'desc']])
            expect(result.limit).toBe(25)
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentProductRecommendationsCountQueryFactoryV2(
                    mockContext,
                )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_PRODUCT_RECOMMENDATIONS_COUNT,
            )
        })
    })

    describe('AISalesAgentGroupedSalesOpportunity', () => {
        it('should build query with storeIntegrationId dimension', () => {
            const result =
                AISalesAgentGroupedSalesOpportunity.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.dimensions).toEqual(['storeIntegrationId'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentGroupedSalesOpportunityQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_GROUPED_SALES_OPPORTUNITY,
            )
        })
    })

    describe('AISalesAgentTotalNumberOfSalesConversations', () => {
        it('should build query with count measure only', () => {
            const result =
                AISalesAgentTotalNumberOfSalesConversations.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.dimensions).toBeUndefined()
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2(
                    mockContext,
                )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_SALES_CONVERSATIONS,
            )
        })
    })

    describe('AISalesAgentTotalNumberOfAutomatedSales', () => {
        it('should build query excluding handover outcomes', () => {
            const result =
                AISalesAgentTotalNumberOfAutomatedSales.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'outcome',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['handover'],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2(
                    mockContext,
                )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES,
            )
        })
    })

    describe('AISalesAgentTotalProductRecommendations', () => {
        it('should build query with productId SET filter', () => {
            const result =
                AISalesAgentTotalProductRecommendations.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
            expect(result.filters).toContainEqual({
                member: 'productId',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentTotalProductRecommendationsQueryFactoryV2(
                    mockContext,
                )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS,
            )
        })
    })

    describe('AISalesAgentDiscountCodesOffered', () => {
        it('should build query with discountCode SET filter', () => {
            const result = AISalesAgentDiscountCodesOffered.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.filters).toContainEqual({
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'discountCode',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentDiscountCodesOfferedQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED,
            )
        })
    })
})

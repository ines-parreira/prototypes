import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { ProductRecommendation } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import type { AISalesAgentOrdersContext } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import {
    AISalesAgentAverageOrderValue,
    AISalesAgentAverageOrderValueQueryFactoryV2,
    AISalesAgentDiscountCodesApplied,
    AISalesAgentDiscountCodesAppliedQueryFactoryV2,
    AISalesAgentDiscountCodesAverage,
    AISalesAgentDiscountCodesAverageQueryFactoryV2,
    AISalesAgentGMV,
    AISalesAgentGMVInfluenced,
    AISalesAgentGMVInfluencedPerChannel,
    AISalesAgentGMVInfluencedPerChannelQueryFactoryV2,
    AISalesAgentGMVInfluencedQueryFactoryV2,
    AISalesAgentGMVQueryFactoryV2,
    AISalesAgentGMVUsd,
    AISalesAgentGMVUsdInfluenced,
    AISalesAgentGMVUsdInfluencedQueryFactoryV2,
    AISalesAgentGMVUsdQueryFactoryV2,
    AISalesAgentGMVUsdTimeSeries,
    AISalesAgentGMVUsdTimeSeriesQueryFactoryV2,
    AISalesAgentInfluencedUsdTimeSeries,
    AISalesAgentInfluencedUsdTimeSeriesQueryFactoryV2,
    AISalesAgentProductBought,
    AISalesAgentProductBoughtQueryFactoryV2,
    AISalesAgentTotalNumberOfOrder,
    AISalesAgentTotalNumberOfOrderQueryFactoryV2,
    AISalesAgentTotalProductBought,
    AISalesAgentTotalProductBoughtQueryFactoryV2,
    AISalesMedianPurchaseTime,
    AISalesMedianPurchaseTimeQueryFactoryV2,
} from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('AISalesAgentOrders scope', () => {
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

    const mockContextWithGranularity: AISalesAgentOrdersContext = {
        ...mockContext,
        granularity: 'day' as AggregationWindow,
    }

    const mockScopeFilters = [
        {
            member: 'periodStart',
            operator: ReportingStatsOperatorsEnum.AfterDate,
            values: ['2025-09-22T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: ReportingStatsOperatorsEnum.BeforeDate,
            values: ['2025-09-22T23:59:59.000'],
        },
    ]

    describe('AISalesAgentGMV', () => {
        it('should build query with gmv measure and currency dimension', () => {
            const result = AISalesAgentGMV.build(mockContext)

            expect(result).toEqual({
                measures: ['gmv'],
                dimensions: ['currency'],
                timezone: 'UTC',
                filters: mockScopeFilters,
                metricName: METRIC_NAMES.AI_SALES_AGENT_GMV,
                scope: MetricScope.AISalesAgentOrders,
            })
        })

        it('should work with query factory', () => {
            const result = AISalesAgentGMVQueryFactoryV2(mockContext)

            expect(result.measures).toEqual(['gmv'])
            expect(result.dimensions).toEqual(['currency'])
            expect(result.metricName).toBe(METRIC_NAMES.AI_SALES_AGENT_GMV)
        })
    })

    describe('AISalesAgentGMVInfluenced', () => {
        it('should build query with influenced and shopping assistant filters', () => {
            const result = AISalesAgentGMVInfluenced.build(mockContext)

            expect(result.measures).toEqual(['gmv'])
            expect(result.dimensions).toEqual(['currency'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
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
            const result = AISalesAgentGMVInfluencedQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
            )
            expect(result.measures).toEqual(['gmv'])
        })
    })

    describe('AISalesAgentGMVInfluencedPerChannel', () => {
        it('should build query with gmvUsd measure and channel dimension', () => {
            const result =
                AISalesAgentGMVInfluencedPerChannel.build(mockContext)

            expect(result.measures).toEqual(['gmvUsd'])
            expect(result.dimensions).toEqual(['channel'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
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
                AISalesAgentGMVInfluencedPerChannelQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED_PER_CHANNEL,
            )
        })
    })

    describe('AISalesAgentAverageOrderValue', () => {
        it('should build query with gmv and count measures', () => {
            const result = AISalesAgentAverageOrderValue.build(mockContext)

            expect(result.measures).toEqual(['gmv', 'count'])
            expect(result.dimensions).toEqual(['currency'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
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
                AISalesAgentAverageOrderValueQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_AVERAGE_ORDER_VALUE,
            )
        })
    })

    describe('AISalesAgentProductBought', () => {
        it('should build query with product recommendation filter', () => {
            const result = AISalesAgentProductBought.build(mockContext)

            expect(result.measures).toEqual(['uniqCount'])
            expect(result.dimensions).toEqual(['influencedProductId'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [ProductRecommendation],
            })
        })

        it('should work with query factory', () => {
            const result = AISalesAgentProductBoughtQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_PRODUCT_BOUGHT,
            )
        })
    })

    describe('AISalesAgentGMVUsdInfluenced', () => {
        it('should build query with gmvUsd measure', () => {
            const result = AISalesAgentGMVUsdInfluenced.build(mockContext)

            expect(result.measures).toEqual(['gmvUsd'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
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
                AISalesAgentGMVUsdInfluencedQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_GMV_USD_INFLUENCED,
            )
        })
    })

    describe('AISalesAgentGMVUsd', () => {
        it('should build query with gmvUsd measure only', () => {
            const result = AISalesAgentGMVUsd.build(mockContext)

            expect(result.measures).toEqual(['gmvUsd'])
            expect(result.timezone).toBe('UTC')
            expect(result.filters).toEqual(mockScopeFilters)
        })

        it('should work with query factory', () => {
            const result = AISalesAgentGMVUsdQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(METRIC_NAMES.AI_SALES_AGENT_GMV_USD)
        })
    })

    describe('AISalesAgentTotalNumberOfOrder', () => {
        it('should build query with count measure and shopping assistant filter', () => {
            const result = AISalesAgentTotalNumberOfOrder.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should include isInfluenced filter when onlyInfluenced is true', () => {
            const result = AISalesAgentTotalNumberOfOrderQueryFactoryV2(
                mockContext as AISalesAgentOrdersContext,
                true,
            )

            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
        })

        it('should not include isInfluenced filter when onlyInfluenced is false', () => {
            const result = AISalesAgentTotalNumberOfOrderQueryFactoryV2(
                mockContext as AISalesAgentOrdersContext,
                false,
            )

            expect(result.filters).not.toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
        })

        it('should default to onlyInfluenced=true when parameter not provided', () => {
            const result = AISalesAgentTotalNumberOfOrderQueryFactoryV2(
                mockContext as AISalesAgentOrdersContext,
            )
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
        })
    })

    describe('AISalesAgentTotalProductBought', () => {
        it('should build query with product recommendation and influenced filters', () => {
            const result = AISalesAgentTotalProductBought.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [ProductRecommendation],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentTotalProductBoughtQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_BOUGHT,
            )
        })
    })

    describe('AISalesAgentDiscountCodesApplied', () => {
        it('should build query with discount-code influenced by filter', () => {
            const result = AISalesAgentDiscountCodesApplied.build(mockContext)

            expect(result.measures).toEqual(['count'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['discount-code'],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentDiscountCodesAppliedQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_APPLIED,
            )
        })
    })

    describe('AISalesAgentDiscountCodesAverage', () => {
        it('should build query with averageDiscountUsd measure', () => {
            const result = AISalesAgentDiscountCodesAverage.build(mockContext)

            expect(result.measures).toEqual(['averageDiscountUsd'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['discount-code'],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
        })

        it('should work with query factory', () => {
            const result =
                AISalesAgentDiscountCodesAverageQueryFactoryV2(mockContext)

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_AVERAGE,
            )
        })
    })

    describe('AISalesAgentGMVUsdTimeSeries', () => {
        it('should build query with time dimensions when granularity is provided', () => {
            const result = AISalesAgentGMVUsdTimeSeries.build(
                mockContextWithGranularity,
            )

            expect(result.measures).toEqual(['gmvUsd'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [false],
            })
            expect(result.time_dimensions).toEqual([
                {
                    dimension: 'periodStart',
                    granularity: 'day',
                },
            ])
        })

        it('should work with query factory', () => {
            const result = AISalesAgentGMVUsdTimeSeriesQueryFactoryV2(
                mockContextWithGranularity,
            )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_GMV_USD_TIME_SERIES,
            )
            expect(result.time_dimensions).toBeDefined()
        })
    })

    describe('AISalesAgentInfluencedUsdTimeSeries', () => {
        it('should build query with time dimensions and influenced filters', () => {
            const result = AISalesAgentInfluencedUsdTimeSeries.build(
                mockContextWithGranularity,
            )

            expect(result.measures).toEqual(['gmv'])
            expect(result.dimensions).toEqual(['currency'])
            expect(result.filters).toContainEqual({
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            })
            expect(result.filters).toContainEqual({
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            })
            expect(result.time_dimensions).toEqual([
                {
                    dimension: 'periodStart',
                    granularity: 'day',
                },
            ])
        })

        it('should work with query factory', () => {
            const result = AISalesAgentInfluencedUsdTimeSeriesQueryFactoryV2(
                mockContextWithGranularity,
            )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_INFLUENCED_GMV_TIME_SERIES,
            )
        })
    })

    describe('AISalesMedianPurchaseTime', () => {
        it('should build query with medianPurchaseTime measure', () => {
            const result = AISalesMedianPurchaseTime.build(mockContext)

            expect(result.measures).toEqual(['medianPurchaseTime'])
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_MEDIAN_PURCHASE_TIME,
            )
            expect(result.filters).toEqual([
                ...mockScopeFilters,
                {
                    member: 'isInfluenced',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [true],
                },
                {
                    member: 'source',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['shopping-assistant'],
                },
            ])
        })

        it('should work with query factory', () => {
            const result = AISalesMedianPurchaseTimeQueryFactoryV2(
                mockContext as AISalesAgentOrdersContext,
            )

            expect(result.metricName).toBe(
                METRIC_NAMES.AI_SALES_AGENT_MEDIAN_PURCHASE_TIME,
            )
            expect(result.measures).toEqual(['medianPurchaseTime'])
        })
    })
})

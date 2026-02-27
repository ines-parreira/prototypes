import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    convertCampaignOrderPerformance,
    convertCampaignOrderPerformanceQueryFactoryV2,
    convertCampaignOrdersTimeSeriesQueryFactoryV2,
    convertCampaignOrderTotals,
    convertCampaignOrderTotalsQueryFactoryV2,
    convertCampaignShareGraph,
    convertCampaignShareGraphQueryFactoryV2,
    convertRevenueGraphQueryFactoryV2,
    convertStoreRevenueTotal,
    convertStoreRevenueTotalQueryFactoryV2,
} from 'domains/reporting/models/scopes/convertOrderConversion'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('convertOrderConversion scope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00',
            end_datetime: '2025-09-03T23:59:59',
        },
    }

    const timezone = 'UTC'
    const granularity = 'day' as AggregationWindow

    const context = {
        timezone,
        filters,
        granularity,
    }

    const scopeFilters = [
        {
            member: 'periodStart',
            operator: ReportingStatsOperatorsEnum.AfterDate,
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: ReportingStatsOperatorsEnum.BeforeDate,
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    const defaultTimeDimensions = [
        { dimension: 'createdDatetime', granularity: 'day' },
    ]

    describe('convertCampaignOrderPerformance', () => {
        it('creates query with all order conversion measures', () => {
            const result = convertCampaignOrderPerformance.build(context)

            expect(result).toEqual({
                measures: [
                    'campaignSales',
                    'ticketSales',
                    'ticketSalesCount',
                    'discountSales',
                    'discountSalesCount',
                    'clickSales',
                    'clickSalesCount',
                    'campaignSalesCount',
                ],
                filters: scopeFilters,
                timezone,
                time_dimensions: defaultTimeDimensions,
                metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE,
                scope: MetricScope.ConvertOrderConversion,
            })
        })

        describe('convertCampaignOrderPerformanceQueryFactoryV2', () => {
            it('builds query with campaignId dimension', () => {
                const result = convertCampaignOrderPerformanceQueryFactoryV2(
                    context,
                    'campaignId',
                )

                expect(result.measures).toEqual([
                    'campaignSales',
                    'ticketSales',
                    'ticketSalesCount',
                    'discountSales',
                    'discountSalesCount',
                    'clickSales',
                    'clickSalesCount',
                    'campaignSalesCount',
                ])
                expect(result.dimensions).toEqual(['campaignId'])
                expect(result.metricName).toBe(
                    METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE,
                )
                expect(result.scope).toBe(MetricScope.ConvertOrderConversion)
            })

            it('builds query with abVariant dimension', () => {
                const result = convertCampaignOrderPerformanceQueryFactoryV2(
                    context,
                    'abVariant',
                )

                expect(result.dimensions).toEqual(['abVariant'])
                expect(result.metricName).toBe(
                    METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE,
                )
            })
        })
    })

    describe('convertStoreRevenueTotal', () => {
        it('creates query with gmv measure', () => {
            const result = convertStoreRevenueTotal.build(context)

            expect(result).toEqual({
                measures: ['gmv'],
                filters: scopeFilters,
                timezone,
                time_dimensions: defaultTimeDimensions,
                metricName: METRIC_NAMES.CONVERT_STORE_REVENUE_TOTAL,
                scope: MetricScope.ConvertOrderConversion,
            })
        })

        it('returns the same result as query factory', () => {
            const factoryResult =
                convertStoreRevenueTotalQueryFactoryV2(context)
            const buildResult = convertStoreRevenueTotal.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('convertCampaignOrderTotals', () => {
        it('creates query with campaign sales measures', () => {
            const result = convertCampaignOrderTotals.build(context)

            expect(result).toEqual({
                measures: ['campaignSales', 'campaignSalesCount'],
                filters: scopeFilters,
                timezone,
                time_dimensions: defaultTimeDimensions,
                metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_TOTALS,
                scope: MetricScope.ConvertOrderConversion,
            })
        })

        it('returns the same result as query factory', () => {
            const factoryResult =
                convertCampaignOrderTotalsQueryFactoryV2(context)
            const buildResult = convertCampaignOrderTotals.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('convertCampaignShareGraph', () => {
        it('creates query with ascending time series order', () => {
            const result = convertCampaignShareGraph.build(context)

            expect(result).toEqual({
                measures: ['campaignSales'],
                filters: scopeFilters,
                timezone,
                time_dimensions: defaultTimeDimensions,
                order: [['createdDatetime', 'asc']],
                metricName: METRIC_NAMES.CONVERT_REVENUE_SHARE_GRAPH,
                scope: MetricScope.ConvertOrderConversion,
            })
        })

        it('uses granularity from context', () => {
            const weeklyContext = {
                ...context,
                granularity: 'week' as AggregationWindow,
            }
            const result = convertCampaignShareGraph.build(weeklyContext)

            expect(result.time_dimensions).toEqual([
                { dimension: 'createdDatetime', granularity: 'week' },
            ])
            expect(result.order).toEqual([['createdDatetime', 'asc']])
        })

        it('returns the same result as query factory', () => {
            const factoryResult =
                convertCampaignShareGraphQueryFactoryV2(context)
            const buildResult = convertCampaignShareGraph.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('convertCampaignOrdersTimeSeriesQueryFactoryV2', () => {
        it('creates query with campaignSalesCount measure and ascending order', () => {
            const result =
                convertCampaignOrdersTimeSeriesQueryFactoryV2(context)

            expect(result.measures).toEqual(['campaignSalesCount'])
            expect(result.time_dimensions).toEqual(defaultTimeDimensions)
            expect(result.order).toEqual([['createdDatetime', 'asc']])
            expect(result.metricName).toBe(
                METRIC_NAMES.CONVERT_CAMPAIGN_ORDERS_TIME_SERIES,
            )
            expect(result.scope).toBe(MetricScope.ConvertOrderConversion)
        })

        it('uses granularity from context', () => {
            const weeklyContext = {
                ...context,
                granularity: 'week' as AggregationWindow,
            }
            const result =
                convertCampaignOrdersTimeSeriesQueryFactoryV2(weeklyContext)

            expect(result.time_dimensions).toEqual([
                { dimension: 'createdDatetime', granularity: 'week' },
            ])
        })
    })

    describe('convertRevenueGraphQueryFactoryV2', () => {
        it('creates query with gmv measure and ascending order', () => {
            const result = convertRevenueGraphQueryFactoryV2(context)

            expect(result.measures).toEqual(['gmv'])
            expect(result.time_dimensions).toEqual(defaultTimeDimensions)
            expect(result.order).toEqual([['createdDatetime', 'asc']])
            expect(result.metricName).toBe(METRIC_NAMES.CONVERT_REVENUE_GRAPH)
            expect(result.scope).toBe(MetricScope.ConvertOrderConversion)
        })

        it('uses granularity from context', () => {
            const weeklyContext = {
                ...context,
                granularity: 'week' as AggregationWindow,
            }
            const result = convertRevenueGraphQueryFactoryV2(weeklyContext)

            expect(result.time_dimensions).toEqual([
                { dimension: 'createdDatetime', granularity: 'week' },
            ])
        })
    })
})

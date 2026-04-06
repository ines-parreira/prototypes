import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    aiAgentSalesOrdersInfluencedPerChannel,
    aiAgentSalesOrdersInfluencedPerChannelQueryV2Factory,
    aiAgentSalesOrdersInfluencedPerEngagementType,
    aiAgentSalesOrdersInfluencedPerEngagementTypeQueryV2Factory,
    aiAgentSalesTotalSalesPerChannel,
    aiAgentSalesTotalSalesPerChannelQueryV2Factory,
    aiAgentSalesTotalSalesPerEngagementType,
    aiAgentSalesTotalSalesPerEngagementTypeQueryV2Factory,
    aiSalesAgentOrdersPerformanceScope,
    averageOrderValue,
    averageOrderValueQueryV2Factory,
    dynamicOrdersInfluencedCount,
    dynamicOrdersInfluencedCountQueryFactoryV2,
    dynamicOrdersInfluencedCountTimeseries,
    dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2,
    dynamicTotalSalesAmount,
    dynamicTotalSalesAmountQueryFactoryV2,
    dynamicTotalSalesAmountTimeseries,
    dynamicTotalSalesAmountTimeseriesQueryFactoryV2,
    medianPurchaseTime,
    medianPurchaseTimeQueryV2Factory,
    totalSalesAmountUsd,
    totalSalesAmountUsdQueryV2Factory,
} from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiSalesAgentOrdersPerformanceScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'periodStart',
                operator: 'afterDate',
            }),
        )
        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'periodEnd',
                operator: 'beforeDate',
            }),
        )
    })

    it('includes channel filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            channels: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
        )
    })

    it('includes currency filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            currency: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['USD'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'currency', operator: 'one-of' }),
        )
    })

    it('omits currency filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'currency' }),
        )
    })

    it('includes engagementType filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            engagementType: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['proactive'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'engagementType',
                operator: 'one-of',
            }),
        )
    })

    it('omits engagementType filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'engagementType' }),
        )
    })

    it('includes orderId filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            orderId: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'orderId', operator: 'one-of' }),
        )
    })

    it('omits orderId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'orderId' }),
        )
    })

    it('includes storeIntegrationId filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            storeIntegrations: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [1],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'integrationId',
                operator: 'one-of',
            }),
        )
    })

    it('omits storeIntegrationId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('totalSalesAmountUsd queries', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const granularity = 'day' as AggregationWindow
    const context = { filters, timezone, granularity }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    describe('totalSalesAmountUsd', () => {
        it('creates query with totalSalesAmountUsd measure', () => {
            expect(totalSalesAmountUsd.build(context)).toEqual({
                metricName:
                    METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_TOTAL_SALES,
                scope: 'ai-sales-agent-orders-performance',
                measures: ['totalSalesAmountUsd'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
            })
        })
    })

    describe('totalSalesAmountUsdQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(totalSalesAmountUsdQueryV2Factory(context)).toEqual(
                totalSalesAmountUsd.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = totalSalesAmountUsdQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_TOTAL_SALES,
            )
        })

        it('queries the totalSalesAmountUsd measure', () => {
            const result = totalSalesAmountUsdQueryV2Factory(context)
            expect(result.measures).toContain('totalSalesAmountUsd')
        })
    })
})

describe('engagement type sales performance queries', () => {
    const context = {
        filters: {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        },
        timezone: 'utc',
    }

    it('builds total sales per engagement type query', () => {
        expect(aiAgentSalesTotalSalesPerEngagementType.build(context)).toEqual({
            metricName:
                'ai-agent-sales-performance-total-sales-per-engagement-type',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['totalSalesAmountUsd'],
            dimensions: ['engagementType'],
            timezone: 'utc',
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
            ],
        })
    })

    it('builds orders influenced per engagement type query', () => {
        expect(
            aiAgentSalesOrdersInfluencedPerEngagementType.build(context),
        ).toEqual({
            metricName:
                'ai-agent-sales-performance-orders-influenced-per-engagement-type',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            dimensions: ['engagementType'],
            timezone: 'utc',
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
            ],
        })
    })

    it('query factories match build', () => {
        expect(
            aiAgentSalesTotalSalesPerEngagementTypeQueryV2Factory(context),
        ).toEqual(aiAgentSalesTotalSalesPerEngagementType.build(context))
        expect(
            aiAgentSalesOrdersInfluencedPerEngagementTypeQueryV2Factory(
                context,
            ),
        ).toEqual(aiAgentSalesOrdersInfluencedPerEngagementType.build(context))
    })
})

describe('medianPurchaseTime queries', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const granularity = 'day' as AggregationWindow
    const context = { filters, timezone, granularity }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    describe('medianPurchaseTime', () => {
        it('creates query with medianPurchaseTime measure', () => {
            expect(medianPurchaseTime.build(context)).toEqual({
                metricName:
                    METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_MEDIAN_PURCHASE_TIME,
                scope: 'ai-sales-agent-orders-performance',
                measures: ['medianPurchaseTime'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
            })
        })
    })

    describe('medianPurchaseTimeQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(medianPurchaseTimeQueryV2Factory(context)).toEqual(
                medianPurchaseTime.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = medianPurchaseTimeQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_MEDIAN_PURCHASE_TIME,
            )
        })

        it('queries the medianPurchaseTime measure', () => {
            const result = medianPurchaseTimeQueryV2Factory(context)
            expect(result.measures).toContain('medianPurchaseTime')
        })
    })
})

describe('averageOrderValue queries', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const granularity = 'day' as AggregationWindow
    const context = { filters, timezone, granularity }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    describe('averageOrderValue', () => {
        it('creates query with averageOrderValue measure', () => {
            expect(averageOrderValue.build(context)).toEqual({
                metricName:
                    METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AVERAGE_ORDER_VALUE,
                scope: 'ai-sales-agent-orders-performance',
                measures: ['averageOrderValue'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
            })
        })
    })

    describe('averageOrderValueQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(averageOrderValueQueryV2Factory(context)).toEqual(
                averageOrderValue.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = averageOrderValueQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AVERAGE_ORDER_VALUE,
            )
        })

        it('queries the averageOrderValue measure', () => {
            const result = averageOrderValueQueryV2Factory(context)
            expect(result.measures).toContain('averageOrderValue')
        })
    })
})

describe('dynamicTotalSalesAmount', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('creates query without dimensions when no dimension provided', () => {
        const actual = dynamicTotalSalesAmount.build({
            ...context,
            dimensions: [],
        })

        expect(actual).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-total-sales-amount',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['totalSalesAmount'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('creates query with the provided dimension', () => {
        const actual = dynamicTotalSalesAmount.build({
            ...context,
            dimensions: ['channel'],
        })

        expect(actual).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-total-sales-amount',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['totalSalesAmount'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('dynamicTotalSalesAmountQueryFactoryV2', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    it('returns query with empty dimensions when no dimension provided', () => {
        const result = dynamicTotalSalesAmountQueryFactoryV2(context)

        expect(result.dimensions).toBeUndefined()
    })

    it('returns query with the provided dimension', () => {
        const result = dynamicTotalSalesAmountQueryFactoryV2({
            ...context,
            dimensions: ['channel'],
        })

        expect(result.dimensions).toEqual(['channel'])
    })

    it('returns the same result as calling build directly with the dimension', () => {
        const ctx = { ...context, dimensions: ['channel'] as const }

        expect(dynamicTotalSalesAmountQueryFactoryV2(ctx)).toEqual(
            dynamicTotalSalesAmount.build(ctx),
        )
    })
})

describe('dynamicOrdersInfluencedCount', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('creates query without dimensions when no dimension provided', () => {
        const actual = dynamicOrdersInfluencedCount.build({
            ...context,
            dimensions: [],
        })

        expect(actual).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-orders-influenced-count',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('creates query with the provided dimension', () => {
        const actual = dynamicOrdersInfluencedCount.build({
            ...context,
            dimensions: ['channel'],
        })

        expect(actual).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-orders-influenced-count',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('dynamicOrdersInfluencedCountQueryFactoryV2', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    it('returns query with empty dimensions when no dimension provided', () => {
        const result = dynamicOrdersInfluencedCountQueryFactoryV2(context)

        expect(result.dimensions).toBeUndefined()
    })

    it('returns query with the provided dimension', () => {
        const result = dynamicOrdersInfluencedCountQueryFactoryV2({
            ...context,
            dimensions: ['channel'],
        })

        expect(result.dimensions).toEqual(['channel'])
    })

    it('returns the same result as calling build directly with the dimension', () => {
        const ctx = { ...context, dimensions: ['channel'] as const }

        expect(dynamicOrdersInfluencedCountQueryFactoryV2(ctx)).toEqual(
            dynamicOrdersInfluencedCount.build(ctx),
        )
    })
})

describe('dynamicOrdersInfluencedCountTimeseries', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('creates query with time_dimensions using granularity from context', () => {
        expect(
            dynamicOrdersInfluencedCountTimeseries.build({
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [],
            }),
        ).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-orders-influenced-count-timeseries',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'day' },
            ],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('creates query with the provided dimensions', () => {
        expect(
            dynamicOrdersInfluencedCountTimeseries.build({
                ...context,
                granularity: 'week' as AggregationWindow,
                dimensions: ['channel'],
            }),
        ).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-orders-influenced-count-timeseries',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'week' },
            ],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('returns the same result as calling build directly', () => {
        const ctx = {
            ...context,
            granularity: 'day' as AggregationWindow,
        }

        expect(
            dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2(ctx),
        ).toEqual(dynamicOrdersInfluencedCountTimeseries.build(ctx))
    })

    it('returns query with time_dimensions when granularity is provided', () => {
        const result = dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2({
            ...context,
            granularity: 'month' as AggregationWindow,
            dimensions: [],
        })

        expect(result).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-orders-influenced-count-timeseries',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'month' },
            ],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('returns query with the provided dimensions', () => {
        const result = dynamicOrdersInfluencedCountTimeSeriesQueryFactoryV2({
            ...context,
            granularity: 'day' as AggregationWindow,
            dimensions: ['channel'],
        })

        expect(result).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-orders-influenced-count-timeseries',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'day' },
            ],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('aiAgentSalesTotalSalesPerChannel', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('builds query with channel dimension and period filters', () => {
        const actual = aiAgentSalesTotalSalesPerChannel.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-sales-performance-total-sales-per-channel',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['totalSalesAmountUsd'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('aiAgentSalesTotalSalesPerChannelQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentSalesTotalSalesPerChannelQueryV2Factory(context),
            ).toEqual(aiAgentSalesTotalSalesPerChannel.build(context))
        })
    })
})

describe('aiAgentSalesOrdersInfluencedPerChannel', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('builds query with channel dimension and period filters', () => {
        const actual = aiAgentSalesOrdersInfluencedPerChannel.build(context)

        expect(actual).toEqual({
            metricName:
                'ai-agent-sales-performance-orders-influenced-per-channel',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['ordersInfluencedCount'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('aiAgentSalesOrdersInfluencedPerChannelQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentSalesOrdersInfluencedPerChannelQueryV2Factory(context),
            ).toEqual(aiAgentSalesOrdersInfluencedPerChannel.build(context))
        })
    })
})

describe('dynamicTotalSalesAmountTimeseries', () => {
    const filters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    const periodFilters = [
        {
            member: 'periodStart',
            operator: 'afterDate',
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: 'beforeDate',
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    it('creates query with time_dimensions using granularity from context', () => {
        expect(
            dynamicTotalSalesAmountTimeseries.build({
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [],
            }),
        ).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-total-sales-amount-timeseries',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['totalSalesAmount'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'day' },
            ],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('creates query with the provided dimensions', () => {
        expect(
            dynamicTotalSalesAmountTimeseries.build({
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: ['channel'],
            }),
        ).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-total-sales-amount-timeseries',
            scope: 'ai-sales-agent-orders-performance',
            measures: ['totalSalesAmount'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'day' },
            ],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('dynamicTotalSalesAmountTimeseriesQueryFactoryV2', () => {
    const filters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    it('returns the same result as calling build directly', () => {
        const ctx = {
            ...context,
            granularity: 'day' as AggregationWindow,
            dimensions: [] as const,
        }

        expect(dynamicTotalSalesAmountTimeseriesQueryFactoryV2(ctx)).toEqual(
            dynamicTotalSalesAmountTimeseries.build(ctx),
        )
    })

    it('returns query with time_dimensions when granularity is provided', () => {
        const result = dynamicTotalSalesAmountTimeseriesQueryFactoryV2({
            ...context,
            granularity: 'week' as AggregationWindow,
            dimensions: [],
        })

        expect(result.time_dimensions).toEqual([
            { dimension: 'eventDatetime', granularity: 'week' },
        ])
    })

    it('returns query with the provided dimensions', () => {
        const result = dynamicTotalSalesAmountTimeseriesQueryFactoryV2({
            ...context,
            granularity: 'day' as AggregationWindow,
            dimensions: ['channel'],
        })

        expect(result.dimensions).toEqual(['channel'])
    })
})

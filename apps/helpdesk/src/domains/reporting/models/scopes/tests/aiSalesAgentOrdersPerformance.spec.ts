import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    aiSalesAgentOrdersPerformanceScope,
    averageOrderValue,
    averageOrderValueQueryV2Factory,
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

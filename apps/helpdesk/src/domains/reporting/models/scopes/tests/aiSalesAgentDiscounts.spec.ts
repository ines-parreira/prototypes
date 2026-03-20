import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    aiSalesAgentDiscountsScope,
    appliedDiscountCodes,
    appliedDiscountCodesQueryV2Factory,
    averageDiscountAmount,
    averageDiscountAmountQueryV2Factory,
    discountCodesOffered,
    discountCodesOfferedQueryV2Factory,
    discountUsage,
    discountUsageQueryV2Factory,
} from 'domains/reporting/models/scopes/aiSalesAgentDiscounts'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiSalesAgentDiscountsScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentDiscountsScope.config,
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
            aiSalesAgentDiscountsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentDiscountsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
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
            aiSalesAgentDiscountsScope.config,
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
            aiSalesAgentDiscountsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'engagementType' }),
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
            aiSalesAgentDiscountsScope.config,
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
            aiSalesAgentDiscountsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
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
            aiSalesAgentDiscountsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'currency',
                operator: 'one-of',
            }),
        )
    })

    it('omits currency filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentDiscountsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'currency' }),
        )
    })
})

describe('discountCodesOffered queries', () => {
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

    const timeDimensions = [
        {
            dimension: 'eventDatetime',
            granularity: 'day',
        },
    ]

    describe('discountCodesOffered', () => {
        it('creates query with offeredDiscountCodesCount measure', () => {
            expect(discountCodesOffered.build(context)).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-discount-codes-offered',
                scope: 'ai-sales-agent-discounts',
                measures: ['offeredDiscountCodesCount'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('discountCodesOfferedQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(discountCodesOfferedQueryV2Factory(context)).toEqual(
                discountCodesOffered.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = discountCodesOfferedQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_CODES_OFFERED,
            )
        })

        it('queries the offeredDiscountCodesCount measure', () => {
            const result = discountCodesOfferedQueryV2Factory(context)
            expect(result.measures).toContain('offeredDiscountCodesCount')
        })
    })
})

describe('averageDiscountAmount queries', () => {
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

    const timeDimensions = [
        {
            dimension: 'eventDatetime',
            granularity: 'day',
        },
    ]

    describe('averageDiscountAmount', () => {
        it('creates query with averageDiscountAmount measure', () => {
            expect(averageDiscountAmount.build(context)).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-average-discount-amount',
                scope: 'ai-sales-agent-discounts',
                measures: ['averageDiscountAmount'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('averageDiscountAmountQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(averageDiscountAmountQueryV2Factory(context)).toEqual(
                averageDiscountAmount.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = averageDiscountAmountQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AVERAGE_DISCOUNT_AMOUNT,
            )
        })

        it('queries the averageDiscountAmount measure', () => {
            const result = averageDiscountAmountQueryV2Factory(context)
            expect(result.measures).toContain('averageDiscountAmount')
        })
    })
})

describe('discountUsage queries', () => {
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

    const timeDimensions = [
        {
            dimension: 'eventDatetime',
            granularity: 'day',
        },
    ]

    describe('discountUsage', () => {
        it('creates query with discountUsage measure', () => {
            expect(discountUsage.build(context)).toEqual({
                metricName: 'ai-agent-shopping-assistant-discount-usage',
                scope: 'ai-sales-agent-discounts',
                measures: ['discountUsage'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('discountUsageQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(discountUsageQueryV2Factory(context)).toEqual(
                discountUsage.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = discountUsageQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_USAGE,
            )
        })

        it('queries the discountUsage measure', () => {
            const result = discountUsageQueryV2Factory(context)
            expect(result.measures).toContain('discountUsage')
        })
    })
})

describe('appliedDiscountCodes queries', () => {
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

    const timeDimensions = [
        {
            dimension: 'eventDatetime',
            granularity: 'day',
        },
    ]

    describe('appliedDiscountCodes', () => {
        it('creates query with appliedDiscountCodesCount measure', () => {
            expect(appliedDiscountCodes.build(context)).toEqual({
                metricName:
                    METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_CODES_APPLIED,
                scope: 'ai-sales-agent-discounts',
                measures: ['appliedDiscountCodesCount'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('appliedDiscountCodesQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(appliedDiscountCodesQueryV2Factory(context)).toEqual(
                appliedDiscountCodes.build(context),
            )
        })

        it('sets the correct metricName', () => {
            const result = appliedDiscountCodesQueryV2Factory(context)
            expect(result.metricName).toBe(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_CODES_APPLIED,
            )
        })

        it('queries the appliedDiscountCodesCount measure', () => {
            const result = appliedDiscountCodesQueryV2Factory(context)
            expect(result.measures).toContain('appliedDiscountCodesCount')
        })
    })
})

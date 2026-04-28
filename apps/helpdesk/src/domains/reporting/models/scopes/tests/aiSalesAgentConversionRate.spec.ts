import {
    aiSalesAgentConversionRateScope,
    conversionRate,
    conversionRateQueryV2Factory,
    dynamicConversionRate,
    dynamicConversionRateQueryFactoryV2,
    dynamicConversionRateTimeseries,
    dynamicConversionRateTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiSalesAgentConversionRateScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentConversionRateScope.config,
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
            aiSalesAgentConversionRateScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentConversionRateScope.config,
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
            aiSalesAgentConversionRateScope.config,
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
            aiSalesAgentConversionRateScope.config,
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
            aiSalesAgentConversionRateScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'storeIntegrationId',
                operator: 'one-of',
            }),
        )
    })

    it('omits storeIntegrationId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentConversionRateScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('conversionRate', () => {
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

    it('builds query with correct metricName, scope, measures, and filters', () => {
        const actual = conversionRate.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-shopping-assistant-conversion-rate',
            scope: 'ai-sales-agent-conversion-rate',
            measures: ['conversionRate'],
            dimensions: undefined,
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('conversionRateQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(conversionRateQueryV2Factory(context)).toEqual(
                conversionRate.build(context),
            )
        })
    })
})

describe('dynamicConversionRate', () => {
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

    it('creates query without dimensions when no dimension provided', () => {
        const actual = dynamicConversionRate.build({
            ...context,
            dimensions: [],
        })

        expect(actual).toEqual({
            metricName: 'ai-agent-dynamic-shopping-assistant-conversion-rate',
            scope: 'ai-sales-agent-conversion-rate',
            measures: ['conversionRate'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('creates query with the provided dimension', () => {
        const actual = dynamicConversionRate.build({
            ...context,
            dimensions: ['channel'],
        })

        expect(actual).toEqual({
            metricName: 'ai-agent-dynamic-shopping-assistant-conversion-rate',
            scope: 'ai-sales-agent-conversion-rate',
            measures: ['conversionRate'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('dynamicConversionRateQueryFactoryV2', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    it('returns query with empty dimensions when no dimension provided', () => {
        const result = dynamicConversionRateQueryFactoryV2(context)

        expect(result.dimensions).toBeUndefined()
    })

    it('returns query with the provided dimension', () => {
        const result = dynamicConversionRateQueryFactoryV2({
            ...context,
            dimensions: ['channel'],
        })

        expect(result.dimensions).toEqual(['channel'])
    })

    it('returns the same result as calling build directly with the dimension', () => {
        const ctx = { ...context, dimensions: ['channel'] as const }

        expect(dynamicConversionRateQueryFactoryV2(ctx)).toEqual(
            dynamicConversionRate.build(ctx),
        )
    })
})

describe('dynamicConversionRateTimeseries', () => {
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

    it('creates query with time_dimensions using granularity from context', () => {
        expect(
            dynamicConversionRateTimeseries.build({
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [],
            }),
        ).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-conversion-rate-timeseries',
            scope: 'ai-sales-agent-conversion-rate',
            measures: ['conversionRate'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'day' },
            ],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })

    it('creates query with the provided dimensions', () => {
        expect(
            dynamicConversionRateTimeseries.build({
                ...context,
                granularity: 'week' as AggregationWindow,
                dimensions: ['channel'],
            }),
        ).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-conversion-rate-timeseries',
            scope: 'ai-sales-agent-conversion-rate',
            measures: ['conversionRate'],
            time_dimensions: [
                { dimension: 'eventDatetime', granularity: 'week' },
            ],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })
})

describe('dynamicConversionRateTimeseriesQueryFactoryV2', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    it('returns the same result as calling build directly', () => {
        const ctx = {
            ...context,
            granularity: 'day' as AggregationWindow,
        }

        expect(dynamicConversionRateTimeseriesQueryFactoryV2(ctx)).toEqual(
            dynamicConversionRateTimeseries.build(ctx),
        )
    })

    it('returns query with time_dimensions when granularity is provided', () => {
        const result = dynamicConversionRateTimeseriesQueryFactoryV2({
            ...context,
            granularity: 'day' as AggregationWindow,
        })

        expect(result.time_dimensions).toEqual([
            { dimension: 'eventDatetime', granularity: 'day' },
        ])
    })

    it('returns query with the provided dimensions', () => {
        const result = dynamicConversionRateTimeseriesQueryFactoryV2({
            ...context,
            granularity: 'day' as AggregationWindow,
            dimensions: ['channel'],
        })

        expect(result.dimensions).toEqual(['channel'])
    })
})

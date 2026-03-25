import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    aiSalesAgentActivityScope,
    dynamicRevenuePerInteraction,
    dynamicRevenuePerInteractionQueryFactoryV2,
    recommendedProductCount,
    recommendedProductCountQueryV2Factory,
    revenuePerInteraction,
    revenuePerInteractionQueryV2Factory,
} from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiSalesAgentActivityScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('recommendedProductCount queries', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const timezone = 'utc'
    const granularity = 'day' as AggregationWindow

    const context = {
        filters,
        timezone,
        granularity,
    }

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

    describe('recommendedProductCount', () => {
        it('creates query with recommendedProductCount measure', () => {
            expect(recommendedProductCount.build(context)).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-product-recommendations',
                scope: 'ai-sales-agent-activity',
                measures: ['recommendedProductCount'],
                timezone: 'utc',
                filters: periodFilters,
                time_dimensions: timeDimensions,
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('recommendedProductCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                expect(recommendedProductCountQueryV2Factory(context)).toEqual(
                    recommendedProductCount.build(context),
                )
            })
        })
    })
})

describe('revenuePerInteractionQueryV2Factory', () => {
    const context = {
        filters: {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        },
        timezone: 'UTC',
    }

    it('returns the same result as calling build directly', () => {
        expect(revenuePerInteractionQueryV2Factory(context)).toEqual(
            revenuePerInteraction.build(context),
        )
    })

    it('sets the correct metricName', () => {
        const result = revenuePerInteractionQueryV2Factory(context)
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
        )
    })

    it('queries the revenuePerInteraction measure', () => {
        const result = revenuePerInteractionQueryV2Factory(context)
        expect(result.measures).toContain('revenuePerInteraction')
    })
})

describe('dynamicRevenuePerInteraction', () => {
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
        const actual = dynamicRevenuePerInteraction.build({
            ...context,
            dimensions: [],
        })

        expect(actual).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-revenue-per-interaction',
            scope: 'ai-sales-agent-activity',
            measures: ['revenuePerInteraction'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    it('creates query with the provided dimension', () => {
        const actual = dynamicRevenuePerInteraction.build({
            ...context,
            dimensions: ['channel'],
        })

        expect(actual).toEqual({
            metricName:
                'ai-agent-dynamic-shopping-assistant-revenue-per-interaction',
            scope: 'ai-sales-agent-activity',
            measures: ['revenuePerInteraction'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
})

describe('dynamicRevenuePerInteractionQueryFactoryV2', () => {
    const filters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const context = { filters, timezone: 'utc' }

    it('returns query with empty dimensions when no dimension provided', () => {
        const result = dynamicRevenuePerInteractionQueryFactoryV2(context)

        expect(result.dimensions).toBeUndefined()
    })

    it('returns query with the provided dimension', () => {
        const result = dynamicRevenuePerInteractionQueryFactoryV2({
            ...context,
            dimensions: ['channel'],
        })

        expect(result.dimensions).toEqual(['channel'])
    })

    it('returns the same result as calling build directly with the dimension', () => {
        const ctx = { ...context, dimensions: ['channel'] as const }

        expect(dynamicRevenuePerInteractionQueryFactoryV2(ctx)).toEqual(
            dynamicRevenuePerInteraction.build(ctx),
        )
    })
})

import {
    aiAgentDecreaseInResolutionTimeScope,
    dynamicAiAgentDecreaseInResolutionTime,
    dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentDecreaseInResolutionTimeScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
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

    it('includes aiAgentRole filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            aiAgentRole: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['ai-agent-support'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
            }),
        )
    })

    it('omits aiAgentRole filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'aiAgentRole' }),
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
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
        )
    })

    it('includes customField filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            customField: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['my-field'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'customField',
                operator: 'one-of',
            }),
        )
    })

    it('omits customField filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'customField' }),
        )
    })

    it('includes customFieldId filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            customFieldId: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [42],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'customFieldId',
                operator: 'one-of',
            }),
        )
    })

    it('omits customFieldId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'customFieldId' }),
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
            aiAgentDecreaseInResolutionTimeScope.config,
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
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('dynamicAiAgentDecreaseInResolutionTime', () => {
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
        expect(
            dynamicAiAgentDecreaseInResolutionTime.build({
                ...context,
                dimensions: [],
            }),
        ).toEqual({
            metricName:
                'ai-agent-decrease-in-resolution-time-breakdown-per-store',
            scope: 'ai-agent-decrease-in-resolution-time',
            measures: ['medianDecreaseInResolutionTime'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })

    it('creates query with the provided dimension', () => {
        expect(
            dynamicAiAgentDecreaseInResolutionTime.build({
                ...context,
                dimensions: ['storeIntegrationId'],
            }),
        ).toEqual({
            metricName:
                'ai-agent-decrease-in-resolution-time-breakdown-per-store',
            scope: 'ai-agent-decrease-in-resolution-time',
            measures: ['medianDecreaseInResolutionTime'],
            dimensions: ['storeIntegrationId'],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })

    describe('dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const ctx = {
                ...context,
                dimensions: ['storeIntegrationId'] as const,
            }

            expect(
                dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2(ctx),
            ).toEqual(dynamicAiAgentDecreaseInResolutionTime.build(ctx))
        })
    })
})

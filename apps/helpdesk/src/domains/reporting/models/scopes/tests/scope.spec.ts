import { z } from 'zod'

import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { defineScope, initScope, QueryFor } from '../scope'

// Mock the utils module
jest.mock('domains/reporting/models/scopes/utils', () => ({
    createScopeFilters: jest.fn(),
}))

const mockCreateScopeFilters = createScopeFilters as jest.MockedFunction<
    typeof createScopeFilters
>

describe('scope', () => {
    const mockFilters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2025-09-22T00:00:00',
            end_datetime: '2025-09-22T23:59:59',
        },
    }

    const mockContext = {
        timezone: 'UTC',
        filters: mockFilters,
        granularity: 'day' as AggregationWindow,
    }

    const mockScopeFilters = [
        {
            member: 'periodStart',
            operator: ReportingStatsOperatorsEnum.AfterDate,
            values: ['2025-09-22T00:00:00'],
        },
        {
            member: 'periodEnd',
            operator: ReportingStatsOperatorsEnum.BeforeDate,
            values: ['2025-09-22T23:59:59'],
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockCreateScopeFilters.mockReturnValue(mockScopeFilters as any)
    })

    describe('defineScope', () => {
        it('should return the configuration object as-is', () => {
            const config = {
                measures: ['testMeasure'],
                dimensions: ['testDimension'],
                filters: ['periodStart', 'periodEnd'],
            }

            const result = defineScope(config)

            expect(result).toEqual(config)
            expect(result).toBe(config) // Should be the exact same reference
        })

        it('should work with minimal configuration', () => {
            const config = {
                measures: ['onlineTime'],
            }

            const result = defineScope(config)

            expect(result).toEqual(config)
        })

        it('should work with full configuration', () => {
            const config = {
                measures: ['ticketCount'],
                dimensions: ['agents', 'channels'],
                timeDimensions: ['createdDatetime'],
                filters: ['periodStart', 'periodEnd', 'agents'],
                order: ['ticketId'],
            }

            const result = defineScope(config)

            expect(result).toEqual(config)
        })
    })

    describe('initScope', () => {
        it('should return frozen object with define method', () => {
            const scopeFactory = initScope()

            expect(Object.isFrozen(scopeFactory)).toBe(true)
            expect(typeof scopeFactory.define).toBe('function')
        })

        it('should create ScopeBuilder with correct name', () => {
            const scopeFactory = initScope()
            const scopeBuilder = scopeFactory.define('test-scope')

            expect(scopeBuilder.name).toBe('test-scope')
        })
    })

    describe('ScopeBuilder', () => {
        const scopeConfig = defineScope({
            measures: ['testMeasure'],
            dimensions: ['testDimension'],
            filters: ['periodStart', 'periodEnd'],
        })

        const scopeBuilder = initScope<
            typeof scopeConfig,
            typeof mockContext
        >().define('test-scope')

        describe('create', () => {
            it('should return MetricBuilder with correct scope and metric name', () => {
                const metricBuilder = scopeBuilder.create('test-metric')

                expect(metricBuilder.scope).toBe('test-scope')
                expect(metricBuilder.name).toBe('test-metric')
            })
        })
    })

    describe('MetricBuilder', () => {
        const scopeConfig = defineScope({
            measures: ['testMeasure'],
            dimensions: ['testDimension'],
            filters: ['periodStart', 'periodEnd'],
        })

        const metricBuilder = initScope<
            typeof scopeConfig,
            typeof mockContext
        >()
            .define('test-scope')
            .create('test-metric')

        describe('input', () => {
            it('should return MetricBuilderWithInput with schema', () => {
                const schema = z.object({
                    sortDirection: z.enum(['asc', 'desc']),
                })
                const builderWithInput = metricBuilder.defineInput(schema)

                expect(builderWithInput.scope).toBe('test-scope')
                expect(builderWithInput.name).toBe('test-metric')
            })
        })

        describe('query', () => {
            it('should create MetricQuery without input validation', () => {
                const metricQuery = metricBuilder.defineQuery(({ ctx }) => ({
                    measures: ['testMeasure'],
                    timezone: ctx.timezone,
                    filters: mockScopeFilters as any,
                }))

                expect(metricQuery.scope).toBe('test-scope')
                expect(metricQuery.name).toBe('test-metric')
            })
        })
    })

    describe('MetricBuilderWithInput', () => {
        const scopeConfig = defineScope({
            measures: ['testMeasure'],
            dimensions: ['testDimension'],
            filters: ['periodStart', 'periodEnd'],
        })

        const schema = z.object({ sortDirection: z.enum(['asc', 'desc']) })
        const builderWithInput = initScope<
            typeof scopeConfig,
            typeof mockContext
        >()
            .define('test-scope')
            .create('test-metric')
            .defineInput(schema)

        describe('query', () => {
            it('should create MetricQuery with input validation', () => {
                const queryFactory = jest.fn(({ ctx, input }) => ({
                    measures: ['testMeasure'],
                    timezone: ctx.timezone,
                    filters: mockScopeFilters as any,
                    order: [['testMeasure', input.sortDirection]],
                }))

                const metricQuery = builderWithInput.defineQuery(
                    queryFactory as any,
                )

                expect(metricQuery.scope).toBe('test-scope')
                expect(metricQuery.name).toBe('test-metric')
            })
        })
    })

    describe('MetricQuery', () => {
        const scopeConfig = defineScope({
            measures: ['testMeasure'],
            dimensions: ['testDimension'],
            filters: ['periodStart', 'periodEnd'],
        })

        describe('build without input schema', () => {
            it('should build query and return frozen result', () => {
                const queryFactory = jest.fn(({ ctx }) => ({
                    measures: ['testMeasure'] as const,
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, scopeConfig),
                }))

                const metricQuery = initScope<
                    typeof scopeConfig,
                    typeof mockContext
                >()
                    .define('test-scope')
                    .create('test-metric')
                    .defineQuery(queryFactory)

                const result = metricQuery.build(mockContext)

                expect(queryFactory).toHaveBeenCalledWith({
                    ctx: mockContext,
                    input: undefined,
                })
                expect(mockCreateScopeFilters).toHaveBeenCalledWith(
                    mockFilters,
                    scopeConfig,
                )
                expect(result).toEqual({
                    measures: ['testMeasure'],
                    timezone: 'UTC',
                    filters: mockScopeFilters,
                    scope: 'test-scope',
                })
                expect(Object.isFrozen(result)).toBe(true)
            })
        })

        describe('build with input schema', () => {
            it('should validate input and build query', () => {
                const schema = z.object({
                    sortDirection: z.enum(['asc', 'desc']),
                })
                const queryFactory = jest.fn(({ ctx, input }) => ({
                    measures: ['testMeasure'] as const,
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, scopeConfig),
                    order: [['testMeasure', input.sortDirection]],
                }))

                const metricQuery = initScope<
                    typeof scopeConfig,
                    typeof mockContext
                >()
                    .define('test-scope')
                    .create('test-metric')
                    .defineInput(schema)
                    .defineQuery(queryFactory as any)

                const result = metricQuery.build(mockContext, {
                    sortDirection: 'desc',
                })

                expect(queryFactory).toHaveBeenCalledWith({
                    ctx: mockContext,
                    input: { sortDirection: 'desc' },
                })
                expect(result).toEqual({
                    measures: ['testMeasure'],
                    timezone: 'UTC',
                    filters: mockScopeFilters,
                    order: [['testMeasure', 'desc']],
                    scope: 'test-scope',
                })
                expect(Object.isFrozen(result)).toBe(true)
            })

            it('should throw when schema validation fails', () => {
                const schema = z.object({
                    sortDirection: z.enum(['asc', 'desc']),
                })
                const queryFactory = jest.fn()

                const metricQuery = initScope<
                    typeof scopeConfig,
                    typeof mockContext
                >()
                    .define('test-scope')
                    .create('test-metric')
                    .defineInput(schema)
                    .defineQuery(queryFactory)

                expect(() => {
                    metricQuery.build(mockContext, {
                        sortDirection: 'invalid',
                    } as any)
                }).toThrow()

                expect(queryFactory).not.toHaveBeenCalled()
            })
        })
    })

    describe('End-to-End Integration', () => {
        it('should work like onlineTime scope example', () => {
            const scopeConfig = defineScope({
                measures: ['onlineTime'],
                dimensions: ['agents'],
                filters: ['periodStart', 'periodEnd', 'agents'],
                order: ['onlineTime'],
            })

            const onlineTimeScope = initScope<
                typeof scopeConfig,
                typeof mockContext
            >().define('online-time')

            const onlineTime = onlineTimeScope
                .create('agentxp-online-time')
                .defineQuery(({ ctx }) => ({
                    measures: ['onlineTime'],
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, scopeConfig),
                }))

            const result = onlineTime.build(mockContext)

            expect(mockCreateScopeFilters).toHaveBeenCalledWith(
                mockFilters,
                scopeConfig,
            )
            expect(result).toEqual({
                measures: ['onlineTime'],
                timezone: 'UTC',
                filters: mockScopeFilters,
                scope: 'online-time',
            })
        })

        it('should work like ticketsReplied scope with input validation', () => {
            const scopeConfig = defineScope({
                measures: ['ticketCount'],
                dimensions: ['agents'],
                filters: ['periodStart', 'periodEnd', 'agents'],
                order: ['ticketId'],
            })

            const ticketsRepliedScope = initScope<
                typeof scopeConfig,
                typeof mockContext
            >().define('tickets-replied')

            const direction = z.enum(['asc', 'desc'])

            const openTicketsCountPerAgent = ticketsRepliedScope
                .create('support-performance-tickets-replied-per-agent')
                .defineInput(z.object({ sortDirection: direction }))
                .defineQuery(({ ctx, input }) => {
                    const query: QueryFor<typeof scopeConfig> = {
                        measures: ['ticketCount'],
                        dimensions: ['agents'],
                        timezone: ctx.timezone,
                        filters: createScopeFilters(ctx.filters, scopeConfig),
                    }

                    if (input.sortDirection) {
                        query.order = [['ticketId', input.sortDirection]]
                    }

                    return query
                })

            const result = openTicketsCountPerAgent.build(mockContext, {
                sortDirection: 'asc',
            })

            expect(result).toEqual({
                measures: ['ticketCount'],
                dimensions: ['agents'],
                timezone: 'UTC',
                filters: mockScopeFilters,
                order: [['ticketId', 'asc']],
                scope: 'tickets-replied',
            })
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty scope configuration', () => {
            const scopeConfig = defineScope({})
            const scope = initScope<
                typeof scopeConfig,
                typeof mockContext
            >().define('empty-scope')

            const metric = scope
                .create('empty-metric')
                .defineQuery(({ ctx }) => ({
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, scopeConfig),
                }))

            const result = metric.build(mockContext)

            expect(result.scope).toBe('empty-scope')
            expect(result.timezone).toBe('UTC')
        })

        it('should handle complex filter scenarios', () => {
            const complexFilters: StatsFiltersWithLogicalOperator = {
                period: {
                    start_datetime: '2025-09-22T00:00:00',
                    end_datetime: '2025-09-22T23:59:59',
                },
                agents: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [1, 2, 3],
                },
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['email', 'chat'],
                },
            }

            const complexContext = {
                ...mockContext,
                filters: complexFilters,
            }

            const complexMockFilters = [
                ...mockScopeFilters,
                {
                    member: 'agents',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1', '2', '3'],
                },
                {
                    member: 'channels',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['email', 'chat'],
                },
            ]

            mockCreateScopeFilters.mockReturnValue(complexMockFilters as any)

            const scopeConfig = defineScope({
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd', 'agents', 'channels'],
            })

            const metric = initScope<
                typeof scopeConfig,
                typeof complexContext
            >()
                .define('complex-scope')
                .create('complex-metric')
                .defineQuery(({ ctx }) => ({
                    measures: ['ticketCount'],
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, scopeConfig),
                }))

            const result = metric.build(complexContext)

            expect(mockCreateScopeFilters).toHaveBeenCalledWith(
                complexFilters,
                scopeConfig,
            )
            expect(result.filters).toEqual(complexMockFilters)
        })
    })
})

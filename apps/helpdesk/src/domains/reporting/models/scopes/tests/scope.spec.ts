import {
    OrderDirection,
    ReportingStatsOperatorsEnum,
} from '@gorgias/helpdesk-types'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import type { QueryFor } from '../scope'
import { defineScope } from '../scope'

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
        it('should return a scope class with proper config', () => {
            const config = {
                scope: MetricScope.TicketsOpen,
                measures: ['testMeasure'],
                dimensions: ['ticketId'] as const,
                filters: ['periodStart', 'periodEnd'],
            }

            const result = defineScope(config)

            expect(result.config).toEqual(config)
        })

        it('should work with minimal configuration', () => {
            const config = {
                scope: MetricScope.TicketsOpen,
                measures: ['onlineTime'],
                filters: ['periodStart', 'periodEnd'],
            }

            const result = defineScope(config)

            expect(result.config).toEqual(config)
        })

        it('should work with full configuration', () => {
            const config = {
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                dimensions: ['agentId', 'channel'] as const,
                timeDimensions: ['createdDatetime' as const],
                filters: ['periodStart', 'periodEnd', 'agents' as const],
                order: ['ticketId' as const],
            }

            const result = defineScope(config)

            expect(result.config).toEqual(config)
        })
    })

    describe('ScopeBuilder', () => {
        const scope = defineScope({
            scope: MetricScope.TicketsOpen,
            measures: ['testMeasure'],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'],
        })

        describe('create', () => {
            it('should return MetricBuilder with correct metric name', () => {
                const metricBuilder = scope.defineMetricName('test-metric')

                expect(metricBuilder.config.scope).toBe(MetricScope.TicketsOpen)
                expect(metricBuilder.metricName).toBe('test-metric')
            })
        })
    })

    describe('MetricBuilder', () => {
        const scope = defineScope({
            scope: MetricScope.TicketsOpen,
            measures: ['testMeasure'],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'],
        })

        const metricBuilder = scope.defineMetricName('test-metric')

        describe('query', () => {
            it('should create MetricQuery without input validation', () => {
                const metricQuery = metricBuilder.defineQuery(({ ctx }) => ({
                    measures: ['testMeasure'],
                    timezone: ctx.timezone,
                    filters: mockScopeFilters as any,
                }))

                expect(metricQuery.name).toBe('test-metric')
            })
        })
    })

    describe('MetricBuilderWithInput', () => {
        const scope = defineScope({
            scope: MetricScope.TicketsOpen,
            measures: ['testMeasure'],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'],
        })

        const builderWithInput = scope.defineMetricName('test-metric')

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

                expect(metricQuery.name).toBe('test-metric')
            })
        })
    })

    describe('MetricQuery', () => {
        const scope = defineScope({
            scope: MetricScope.TicketsOpen,
            measures: ['testMeasure'],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'],
        })

        describe('build without input schema', () => {
            it('should build query and return frozen result', () => {
                const queryFactory = jest.fn(() => ({
                    measures: ['testMeasure'] as const,
                }))

                const metricQuery = scope

                    .defineMetricName('test-metric')
                    .defineQuery(queryFactory)

                const result = metricQuery.build(mockContext)

                expect(queryFactory).toHaveBeenCalledWith({
                    ctx: mockContext,
                    config: scope.config,
                })
                expect(result).toEqual({
                    measures: ['testMeasure'],
                    timezone: 'UTC',
                    filters: mockScopeFilters,
                    metricName: 'test-metric',
                    scope: MetricScope.TicketsOpen,
                })
                expect(Object.isFrozen(result)).toBe(true)
            })
        })

        it('build with sortDirection', () => {
            const queryFactory = jest.fn(({ ctx }) => ({
                measures: ['testMeasure'] as const,
                order: [['testMeasure', ctx.sortDirection]],
            }))

            const metricQuery = scope
                .defineMetricName('test-metric')
                .defineQuery(queryFactory as any)

            const result = metricQuery.build({
                ...mockContext,
                sortDirection: OrderDirection.Desc,
            })

            expect(queryFactory).toHaveBeenCalledWith({
                ctx: {
                    ...mockContext,
                    sortDirection: OrderDirection.Desc,
                },
                config: scope.config,
            })
            expect(result).toEqual({
                measures: ['testMeasure'],
                timezone: 'UTC',
                filters: mockScopeFilters,
                order: [['testMeasure', 'desc']],
                metricName: 'test-metric',
                scope: MetricScope.TicketsOpen,
            })
            expect(Object.isFrozen(result)).toBe(true)
        })
    })

    describe('End-to-End Integration', () => {
        it('should work like onlineTime scope example', () => {
            const scope = defineScope({
                scope: MetricScope.OnlineTime,
                measures: ['onlineTime'],
                dimensions: ['agentId'],
                filters: ['periodStart', 'periodEnd', 'agents'],
                order: ['onlineTime'],
            })

            const onlineTimeScopeBuilder = scope

            const onlineTime = onlineTimeScopeBuilder
                .defineMetricName('agentxp-online-time')
                .defineQuery(({ ctx, config }) => ({
                    measures: ['onlineTime'],
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, config),
                }))

            const result = onlineTime.build(mockContext)

            expect(mockCreateScopeFilters).toHaveBeenCalledWith(
                mockFilters,
                scope.config,
            )
            expect(result).toEqual({
                measures: ['onlineTime'],
                timezone: 'UTC',
                filters: mockScopeFilters,
                metricName: 'agentxp-online-time',
                scope: 'online-time',
            })
        })

        it('should work like ticketsReplied scope with input validation', () => {
            const ticketsRepliedScope = defineScope({
                scope: MetricScope.TicketsReplied,
                measures: ['ticketCount'],
                dimensions: ['agentId'],
                filters: ['periodStart', 'periodEnd', 'agents'],
                order: ['ticketId'],
            })

            const ticketsRepliedScopeBuilder = ticketsRepliedScope

            const openTicketsCountPerAgent = ticketsRepliedScopeBuilder
                .defineMetricName(
                    'support-performance-tickets-replied-per-agent',
                )
                .defineQuery(({ ctx, config }) => {
                    const query: QueryFor<typeof ticketsRepliedScope.config> = {
                        measures: ['ticketCount'],
                        dimensions: ['agentId'],
                        timezone: ctx.timezone,
                        filters: createScopeFilters(ctx.filters, config),
                    }

                    if (ctx.sortDirection) {
                        query.order = [['ticketId', ctx.sortDirection]]
                    }

                    return query
                })

            const result = openTicketsCountPerAgent.build({
                ...mockContext,
                sortDirection: OrderDirection.Asc,
            })

            expect(result).toEqual({
                measures: ['ticketCount'],
                dimensions: ['agentId'],
                timezone: 'UTC',
                filters: mockScopeFilters,
                order: [['ticketId', 'asc']],
                metricName: 'support-performance-tickets-replied-per-agent',
                scope: 'tickets-replied',
            })
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty scope configuration', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                filters: ['periodStart', 'periodEnd'],
            })
            const scopeBuilder = scope

            const metric = scopeBuilder
                .defineMetricName('empty-metric' as MetricName)
                .defineQuery(({ ctx, config }) => ({
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, config),
                }))

            const result = metric.build(mockContext)

            expect(result.metricName).toBe('empty-metric' as MetricName)
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
                    member: 'agentId',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['1', '2', '3'],
                },
                {
                    member: 'channel',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['email', 'chat'],
                },
            ]

            mockCreateScopeFilters.mockReturnValue(complexMockFilters as any)

            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd', 'agents', 'channels'],
            })

            const metric = scope

                .defineMetricName('complex-metric' as MetricName)
                .defineQuery(({ ctx, config }) => ({
                    measures: ['ticketCount'],
                    timezone: ctx.timezone,
                    filters: createScopeFilters(ctx.filters, config),
                }))

            const result = metric.build(complexContext)

            expect(mockCreateScopeFilters).toHaveBeenCalledWith(
                complexFilters,
                scope.config,
            )
            expect(result.filters).toEqual(complexMockFilters)
        })
    })
})

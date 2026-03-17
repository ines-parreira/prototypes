import {
    OrderDirection,
    ReportingStatsOperatorsEnum,
} from '@gorgias/helpdesk-types'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { QueryFor } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type { MeasureName } from 'domains/reporting/models/scopes/types'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

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

    const mockContextWithoutGranularity = {
        timezone: 'UTC',
        filters: mockFilters,
    }

    const mockContextWithGranularity = {
        ...mockContextWithoutGranularity,
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
                measures: ['testMeasure'] as unknown as readonly MeasureName[],
                dimensions: ['ticketId'] as const,
                filters: ['periodStart', 'periodEnd'] as const,
            }

            const result = defineScope(config)

            expect(result.config).toEqual(config)
        })

        it('should work with minimal configuration', () => {
            const config = {
                scope: MetricScope.TicketsOpen,
                measures: ['onlineTime'] as unknown as readonly MeasureName[],
                filters: ['periodStart', 'periodEnd'] as const,
            }

            const result = defineScope(config)

            expect(result.config).toEqual(config)
        })

        it('should work with full configuration', () => {
            const config = {
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'] as unknown as readonly MeasureName[],
                dimensions: ['agentId', 'channel'] as const,
                timeDimensions: ['createdDatetime' as const],
                filters: ['periodStart', 'periodEnd', 'agentId'] as const,
                order: ['ticketId' as const],
            }

            const result = defineScope(config)

            expect(result.config).toEqual(config)
        })
    })

    describe('ScopeBuilder', () => {
        const scope = defineScope({
            scope: MetricScope.TicketsOpen,
            measures: ['testMeasure'] as unknown as readonly MeasureName[],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'] as const,
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
            measures: ['testMeasure'] as unknown as readonly MeasureName[],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'] as const,
        })

        const metricBuilder = scope.defineMetricName('test-metric')

        describe('query', () => {
            it('should create MetricQuery without input validation', () => {
                const metricQuery = metricBuilder.defineQuery(({ ctx }) => ({
                    measures: [
                        'testMeasure',
                    ] as unknown as readonly MeasureName[],
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
            measures: ['testMeasure'] as unknown as readonly MeasureName[],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'] as const,
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
            measures: ['testMeasure'] as unknown as readonly MeasureName[],
            dimensions: ['ticketId'],
            filters: ['periodStart', 'periodEnd'] as const,
        })

        describe('build without input schema', () => {
            it('should build query and return frozen result', () => {
                const queryFactory = jest.fn(() => ({
                    measures: [
                        'testMeasure',
                    ] as unknown as readonly MeasureName[],
                }))

                const metricQuery = scope

                    .defineMetricName('test-metric')
                    .defineQuery(queryFactory)

                const result = metricQuery.build(mockContextWithoutGranularity)

                expect(queryFactory).toHaveBeenCalledWith({
                    ctx: mockContextWithoutGranularity,
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
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Desc,
            })

            expect(queryFactory).toHaveBeenCalledWith({
                ctx: {
                    ...mockContextWithoutGranularity,
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
                filters: ['periodStart', 'periodEnd', 'agentId'] as const,
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

            const result = onlineTime.build(mockContextWithoutGranularity)

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
                filters: ['periodStart', 'periodEnd', 'agentId'] as const,
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
                ...mockContextWithoutGranularity,
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

    describe('Context-based Defaults', () => {
        it('should apply time_dimensions from context when granularity is provided', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                timeDimensions: ['createdDatetime'] as const,
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithGranularity,
                granularity: 'day' as AggregationWindow,
            })

            expect(result.time_dimensions).toEqual([
                {
                    dimension: 'createdDatetime',
                    granularity: 'day',
                },
            ])
        })

        it('should apply limit from context when not defined in query', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                limit: 50,
            })

            expect(result.limit).toBe(50)
        })

        it('should apply offset from context when not defined in query', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                offset: 100,
            })

            expect(result.offset).toBe(100)
        })

        it('should apply total from context when not defined in query', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                total: true,
            })

            expect(result.total).toBe(true)
        })

        it('should apply order using sortBy from context when provided', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                dimensions: ['agentId'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['ticketCount', 'agentId'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                    dimensions: ['agentId'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Desc,
                sortBy: 'agentId',
            })

            expect(result.order).toEqual([['agentId', 'desc']])
        })

        it('should apply order using first measure when sortBy not provided and measure in config.order', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['ticketCount'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Asc,
            })

            expect(result.order).toEqual([['ticketCount', 'asc']])
        })

        it('should apply order using first dimension when sortBy not provided and dimension in config.order', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                dimensions: ['agentId'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['agentId'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                    dimensions: ['agentId'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Desc,
            })

            expect(result.order).toEqual([['agentId', 'desc']])
        })

        it('should not apply order when measure is not in config.order', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['otherMeasure'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Desc,
            })

            expect(result.order).toBeUndefined()
        })

        it('should not apply order when config.order is undefined', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build({
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Desc,
            })

            expect(result.order).toBeUndefined()
        })

        it('should not apply order when sortDirection is not provided', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['ticketCount'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const result = metric.build(mockContextWithoutGranularity)

            expect(result.order).toBeUndefined()
        })

        it('should use first measure for order when sortBy is undefined and measure is in config.order', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['ticketCount'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            const contextWithoutSortBy = {
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Asc as OrderDirection,
            }
            const result = metric.build(contextWithoutSortBy)

            expect(result.order).toEqual([['ticketCount', 'asc']])
        })

        it('should use first dimension for order when sortBy is undefined, no measures, and dimension is in config.order', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                dimensions: ['agentId', 'ticketId'],
                measures: ['testMeasure'] as unknown as readonly MeasureName[],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['agentId', 'ticketId'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    dimensions: ['agentId'],
                    measures: ['testMeasure' as unknown as MeasureName],
                }))

            const contextWithoutSortBy = {
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Desc as OrderDirection,
            }
            const result = metric.build(contextWithoutSortBy)

            expect(result.order).toEqual([['agentId', 'desc']])
        })

        it('should fallback to dimension when measure exists but is not in config.order', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                dimensions: ['agentId'],
                filters: ['periodStart', 'periodEnd'] as const,
                order: ['agentId'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                    dimensions: ['agentId'],
                }))

            const contextWithoutSortBy = {
                ...mockContextWithoutGranularity,
                sortDirection: OrderDirection.Asc as OrderDirection,
            }
            const result = metric.build(contextWithoutSortBy)

            expect(result.order).toEqual([['agentId', 'asc']])
        })
    })

    describe('Granularity Type Safety', () => {
        it('should allow granularity when timeDimensions is defined', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                timeDimensions: ['createdDatetime'] as const,
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            // This should compile without errors
            const result = metric.build({
                ...mockContextWithGranularity,
                granularity: 'week' as AggregationWindow,
            })

            expect(result.time_dimensions).toEqual([
                {
                    dimension: 'createdDatetime',
                    granularity: 'week',
                },
            ])
        })

        it('should forbid granularity when timeDimensions is undefined', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            // This should compile - no granularity provided
            const result = metric.build(mockContextWithoutGranularity)
            expect(result.time_dimensions).toBeUndefined()

            const resultWithGranularity = metric.build({
                ...mockContextWithoutGranularity,
                granularity: 'day' as AggregationWindow,
            })
            // no time_dimensions get added even if we pass granularity
            expect(resultWithGranularity.time_dimensions).toBeUndefined()
        })

        it('should forbid granularity when timeDimensions is empty array', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                timeDimensions: [] as const,
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            // This should compile - no granularity provided
            const result = metric.build(mockContextWithoutGranularity)

            expect(result.time_dimensions).toBeUndefined()

            // NOTE: The following would be a TypeScript error (uncomment to verify):
            // const resultWithGranularity = metric.build({
            //     ...mockContextWithoutGranularity,
            //     granularity: 'day' as AggregationWindow,
            // })
            // Type error: granularity is not allowed when timeDimensions is empty
        })

        it('should not apply time_dimensions when granularity is undefined and timeDimensions exist', () => {
            const scope = defineScope({
                scope: MetricScope.TicketsOpen,
                measures: ['ticketCount'],
                timeDimensions: ['createdDatetime'] as const,
                filters: ['periodStart', 'periodEnd'] as const,
            })

            const metric = scope
                .defineMetricName('test-metric')
                .defineQuery(() => ({
                    measures: ['ticketCount'],
                }))

            // Build without granularity - time_dimensions should not be applied
            const result = metric.build({
                timezone: 'UTC',
                filters: mockFilters,
            })

            expect(result.time_dimensions).toBeUndefined()
        })
    })

    describe('Edge Cases', () => {
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
                ...mockContextWithoutGranularity,
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
                filters: [
                    'periodStart',
                    'periodEnd',
                    'agentId',
                    'channel',
                ] as const,
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

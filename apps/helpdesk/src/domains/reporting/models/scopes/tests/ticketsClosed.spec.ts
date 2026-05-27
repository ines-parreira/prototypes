import { OrderDirection } from '@gorgias/helpdesk-types'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    aiAgentAllAgentsClosedTickets,
    aiAgentAllAgentsClosedTicketsQueryV2Factory,
    closedTicketsBreakdownQueryFactoryV2,
    closedTicketsCount,
    closedTicketsCountQueryV2Factory,
    closedTicketsPerAgent,
    closedTicketsPerAgentQueryV2Factory,
    closedTicketsPerChannel,
    closedTicketsPerChannelQueryV2Factory,
    closedTicketsTimeseries,
    closedTicketsTimeseriesQueryFactoryV2,
    closedTicketsTimeseriesQueryV2Factory,
    closedTicketsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/ticketsClosed'
import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

describe('ticketsClosedScope', () => {
    const filters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
        agents: withDefaultLogicalOperator([123]),
    }

    const timezone = 'utc'

    const granularity = ReportingGranularity.Day as AggregationWindow

    const context = {
        filters,
        timezone,
        granularity,
    }

    describe('closedTicketsCount', () => {
        it('creates query', () => {
            const actual = closedTicketsCount.build(context)

            const expected = {
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsTimeseries', () => {
        it('creates query', () => {
            const actual = closedTicketsTimeseries.build(context)

            const expected = {
                measures: ['ticketCount'],
                order: [['closedDatetime', 'asc']],
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets-time-series',
                scope: 'tickets-closed',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsPerAgent', () => {
        it('creates query', () => {
            const actual = closedTicketsPerAgent.build(context)

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['agentId'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets-per-agent',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = closedTicketsPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['agentId'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-closed-tickets-per-agent',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = closedTicketsPerChannel.build(context)

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['channel'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets-per-channel',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = closedTicketsPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['channel'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                order: [['ticketCount', 'desc']],
                metricName: 'support-performance-closed-tickets-per-channel',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('aiAgentAllAgentsClosedTickets', () => {
        it('creates query', () => {
            const actual = aiAgentAllAgentsClosedTickets.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'ai-agent-all-agents-closed-tickets',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('closedTicketsCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = closedTicketsCountQueryV2Factory(context)
                const buildResult = closedTicketsCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('closedTicketsTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    closedTicketsTimeseriesQueryV2Factory(context)
                const buildResult = closedTicketsTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    closedTicketsTimeseriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'closedDatetime',
                        granularity: 'week',
                    },
                ])
                expect(factoryResult.order).toEqual([['closedDatetime', 'asc']])
            })
        })

        describe('closedTicketsPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    closedTicketsPerAgentQueryV2Factory(context)
                const buildResult = closedTicketsPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    closedTicketsPerAgentQueryV2Factory(contextWithSort)
                const buildResult = closedTicketsPerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'asc']])
            })
        })

        describe('closedTicketsPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    closedTicketsPerChannelQueryV2Factory(context)
                const buildResult = closedTicketsPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    closedTicketsPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    closedTicketsPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'desc']])
            })
        })

        describe('aiAgentAllAgentsClosedTicketsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAllAgentsClosedTicketsQueryV2Factory(context)
                const buildResult = aiAgentAllAgentsClosedTickets.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('performance overview closed tickets triplet', () => {
            const baseFilters = [
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
                {
                    member: 'agentId',
                    operator: 'one-of',
                    values: [123],
                },
            ]

            it('value returns measures + period filters with auto-injected time_dimensions', () => {
                expect(closedTicketsValueQueryFactoryV2(context)).toEqual({
                    metricName: 'performance-overview-closed-tickets-value',
                    scope: 'tickets-closed',
                    measures: ['ticketCount'],
                    timezone: 'utc',
                    filters: baseFilters,
                    time_dimensions: [
                        { dimension: 'closedDatetime', granularity: 'day' },
                    ],
                })
            })

            it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
                expect(
                    closedTicketsBreakdownQueryFactoryV2.build({
                        ...context,
                        dimensions: ['integrationId'],
                    }),
                ).toEqual({
                    metricName: 'performance-overview-closed-tickets-breakdown',
                    scope: 'tickets-closed',
                    measures: ['ticketCount'],
                    dimensions: ['integrationId'],
                    timezone: 'utc',
                    filters: baseFilters,
                    time_dimensions: [
                        { dimension: 'closedDatetime', granularity: 'day' },
                    ],
                })
            })

            it.each([
                [
                    'channel',
                    'performance-overview-closed-tickets-breakdown-per-channel',
                ],
                [
                    'agentId',
                    'performance-overview-closed-tickets-breakdown-per-agent',
                ],
            ] as const)(
                'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, expectedMetricName) => {
                    expect(
                        closedTicketsBreakdownQueryFactoryV2.build({
                            ...context,
                            dimensions: [dimension],
                        }).metricName,
                    ).toBe(expectedMetricName)
                },
            )

            it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
                expect(
                    closedTicketsBreakdownQueryFactoryV2.build({
                        ...context,
                        dimensions: ['channel', 'agentId'],
                    }).metricName,
                ).toBe('performance-overview-closed-tickets-breakdown')
            })

            it('timeseries pins closedDatetime time dimension and adds limit', () => {
                expect(
                    closedTicketsTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-closed-tickets-timeseries',
                    scope: 'tickets-closed',
                    measures: ['ticketCount'],
                    dimensions: [],
                    time_dimensions: [
                        { dimension: 'closedDatetime', granularity: 'day' },
                    ],
                    timezone: 'utc',
                    filters: baseFilters,
                    limit: 10000,
                })
            })

            it('timeseries uses the per-dimension metric name when ctx.dimensions=[channel]', () => {
                expect(
                    closedTicketsTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: ['channel'],
                    }).metricName,
                ).toBe(
                    'performance-overview-closed-tickets-timeseries-per-channel',
                )
            })
        })
    })
})

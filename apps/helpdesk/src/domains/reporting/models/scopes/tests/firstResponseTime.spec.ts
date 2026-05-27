import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    aiAgentAllAgentsFRT,
    aiAgentAllAgentsFRTQueryV2Factory,
    firstResponseTimeBreakdownQueryFactoryV2,
    firstResponseTimeTimeseriesQueryFactoryV2,
    firstResponseTimeValueQueryFactoryV2,
    medianFirstResponseTime,
    medianFirstResponseTimePerAgent,
    medianFirstResponseTimePerAgentQueryV2Factory,
    medianFirstResponseTimePerChannel,
    medianFirstResponseTimePerChannelQueryV2Factory,
    medianFirstResponseTimeQueryV2Factory,
} from 'domains/reporting/models/scopes/firstResponseTime'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('firstResponseTimeScope', () => {
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

    describe('medianFirstResponseTime', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTime.build(context)

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                metricName: 'support-performance-median-first-response-time',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTime.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                order: [['medianFirstResponseTime', 'asc']],
                metricName: 'support-performance-median-first-response-time',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstResponseTimePerAgent', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTimePerAgent.build(context)

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                ],
                metricName:
                    'support-performance-median-first-response-time-per-agent',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTimePerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                ],
                order: [['medianFirstResponseTime', 'desc']],
                metricName:
                    'support-performance-median-first-response-time-per-agent',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstResponseTimePerChannel', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTimePerChannel.build(context)

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                ],
                metricName:
                    'support-performance-median-first-response-time-per-channel',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTimePerChannel.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                ],
                order: [['medianFirstResponseTime', 'asc']],
                metricName:
                    'support-performance-median-first-response-time-per-channel',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('medianFirstResponseTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianFirstResponseTimeQueryV2Factory(context)
                const buildResult = medianFirstResponseTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('supports sorting', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    medianFirstResponseTimeQueryV2Factory(contextWithSort)
                const buildResult =
                    medianFirstResponseTime.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['medianFirstResponseTime', 'desc'],
                ])
            })

            it('supports granularity', () => {
                const contextWithHourlyGranularity = {
                    ...context,
                    granularity: 'hour' as AggregationWindow,
                }

                const factoryResult = medianFirstResponseTimeQueryV2Factory(
                    contextWithHourlyGranularity,
                )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'hour',
                    },
                ])
            })
        })

        describe('medianFirstResponseTimePerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianFirstResponseTimePerAgentQueryV2Factory(context)
                const buildResult =
                    medianFirstResponseTimePerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('supports sorting', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    medianFirstResponseTimePerAgentQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    medianFirstResponseTimePerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['medianFirstResponseTime', 'asc'],
                ])
            })

            it('supports granularity', () => {
                const contextWithWeeklyGranularity = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    medianFirstResponseTimePerAgentQueryV2Factory(
                        contextWithWeeklyGranularity,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('aiAgentAllAgentsFRTQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = aiAgentAllAgentsFRTQueryV2Factory(context)
                const buildResult = aiAgentAllAgentsFRT.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('creates query with correct metric name and measures', () => {
                const result = aiAgentAllAgentsFRTQueryV2Factory(context)

                expect(result.metricName).toBe('ai-agent-all-agents-frt')
                expect(result.measures).toEqual(['medianFirstResponseTime'])
                expect(result.scope).toBe('first-response-time')
            })

            it('includes time dimension when granularity is provided', () => {
                const result = aiAgentAllAgentsFRTQueryV2Factory(context)

                expect(result.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ])
            })
        })

        describe('medianFirstResponseTimePerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianFirstResponseTimePerChannelQueryV2Factory(context)
                const buildResult =
                    medianFirstResponseTimePerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('supports sorting', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    medianFirstResponseTimePerChannelQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    medianFirstResponseTimePerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['medianFirstResponseTime', 'desc'],
                ])
            })

            it('supports granularity', () => {
                const contextWithMonthlyGranularity = {
                    ...context,
                    granularity: 'month' as AggregationWindow,
                }

                const factoryResult =
                    medianFirstResponseTimePerChannelQueryV2Factory(
                        contextWithMonthlyGranularity,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'month',
                    },
                ])
            })
        })

        describe('performance overview first response time triplet', () => {
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

            it('value returns measures + period filters with auto-injected time_dimensions', () => {
                expect(firstResponseTimeValueQueryFactoryV2(context)).toEqual({
                    metricName:
                        'performance-overview-first-response-time-value',
                    scope: 'first-response-time',
                    measures: ['medianFirstResponseTime'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                })
            })

            it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
                expect(
                    firstResponseTimeBreakdownQueryFactoryV2.build({
                        ...context,
                        dimensions: ['integrationId'],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-first-response-time-breakdown',
                    scope: 'first-response-time',
                    measures: ['medianFirstResponseTime'],
                    dimensions: ['integrationId'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                })
            })

            it.each([
                [
                    'channel',
                    'performance-overview-first-response-time-breakdown-per-channel',
                ],
                [
                    'agentId',
                    'performance-overview-first-response-time-breakdown-per-agent',
                ],
            ] as const)(
                'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, expectedMetricName) => {
                    expect(
                        firstResponseTimeBreakdownQueryFactoryV2.build({
                            ...context,
                            dimensions: [dimension],
                        }).metricName,
                    ).toBe(expectedMetricName)
                },
            )

            it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
                expect(
                    firstResponseTimeBreakdownQueryFactoryV2.build({
                        ...context,
                        dimensions: ['channel', 'agentId'],
                    }).metricName,
                ).toBe('performance-overview-first-response-time-breakdown')
            })

            it('timeseries pins createdDatetime time dimension and adds limit', () => {
                expect(
                    firstResponseTimeTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-first-response-time-timeseries',
                    scope: 'first-response-time',
                    measures: ['medianFirstResponseTime'],
                    dimensions: [],
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                    timezone: 'utc',
                    filters: periodFilters,
                    limit: 10000,
                })
            })

            it('timeseries uses the per-dimension metric name when ctx.dimensions=[channel]', () => {
                expect(
                    firstResponseTimeTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: ['channel'],
                    }).metricName,
                ).toBe(
                    'performance-overview-first-response-time-timeseries-per-channel',
                )
            })
        })
    })
})

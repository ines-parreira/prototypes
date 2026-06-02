import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    sentMessagesBreakdownQueryFactoryV2,
    sentMessagesCount,
    sentMessagesCountQueryV2Factory,
    sentMessagesPerAgent,
    sentMessagesPerAgentQueryV2Factory,
    sentMessagesPerChannel,
    sentMessagesPerChannelQueryV2Factory,
    sentMessagesTimeseries,
    sentMessagesTimeseriesQueryFactoryV2,
    sentMessagesTimeseriesQueryV2Factory,
    sentMessagesValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/messagesSent'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('messagesSentScope', () => {
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

    describe('sentMessagesCount', () => {
        it('creates query', () => {
            const actual = sentMessagesCount.build(context)

            const expected = {
                measures: ['messagesCount'],
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
                metricName: 'support-performance-messages-sent',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesTimeseries', () => {
        it('creates query', () => {
            const actual = sentMessagesTimeseries.build(context)

            const expected = {
                measures: ['messagesCount'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                metricName: 'support-performance-messages-sent-time-series',
                scope: 'messages-sent',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesPerAgent', () => {
        it('creates query', () => {
            const actual = sentMessagesPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'asc']],
                metricName: 'support-performance-messages-sent-per-agent',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = sentMessagesPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'desc']],
                metricName: 'support-performance-messages-sent-per-agent',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesPerChannel', () => {
        it('creates query', () => {
            const actual = sentMessagesPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'asc']],
                metricName: 'support-performance-messages-sent-per-channel',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = sentMessagesPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'desc']],
                metricName: 'support-performance-messages-sent-per-channel',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('sentMessagesCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = sentMessagesCountQueryV2Factory(context)
                const buildResult = sentMessagesCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('sentMessagesTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    sentMessagesTimeseriesQueryV2Factory(context)
                const buildResult = sentMessagesTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    sentMessagesTimeseriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'sentDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('sentMessagesPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    sentMessagesPerAgentQueryV2Factory(context)
                const buildResult = sentMessagesPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    sentMessagesPerAgentQueryV2Factory(contextWithSort)
                const buildResult = sentMessagesPerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['messagesCount', 'asc']])
            })
        })

        describe('sentMessagesPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    sentMessagesPerChannelQueryV2Factory(context)
                const buildResult = sentMessagesPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    sentMessagesPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    sentMessagesPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['messagesCount', 'desc']])
            })
        })

        describe('performance overview messages sent triplet', () => {
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
                expect(sentMessagesValueQueryFactoryV2(context)).toEqual({
                    metricName: 'performance-overview-messages-sent-value',
                    scope: 'messages-sent',
                    measures: ['messagesCount'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'sentDatetime', granularity: 'day' },
                    ],
                })
            })

            it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
                expect(
                    sentMessagesBreakdownQueryFactoryV2.build({
                        ...context,
                        dimensions: ['integrationId'],
                    }),
                ).toEqual({
                    metricName: 'performance-overview-messages-sent-breakdown',
                    scope: 'messages-sent',
                    measures: ['messagesCount'],
                    dimensions: ['integrationId'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'sentDatetime', granularity: 'day' },
                    ],
                    limit: 10000,
                })
            })

            it.each([
                [
                    'channel',
                    'performance-overview-messages-sent-breakdown-per-channel',
                ],
                [
                    'agentId',
                    'performance-overview-messages-sent-breakdown-per-agent',
                ],
            ] as const)(
                'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, expectedMetricName) => {
                    expect(
                        sentMessagesBreakdownQueryFactoryV2.build({
                            ...context,
                            dimensions: [dimension],
                        }).metricName,
                    ).toBe(expectedMetricName)
                },
            )

            it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
                expect(
                    sentMessagesBreakdownQueryFactoryV2.build({
                        ...context,
                        dimensions: ['channel', 'agentId'],
                    }).metricName,
                ).toBe('performance-overview-messages-sent-breakdown')
            })

            it('timeseries pins sentDatetime time dimension and adds limit', () => {
                expect(
                    sentMessagesTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName: 'performance-overview-messages-sent-timeseries',
                    scope: 'messages-sent',
                    measures: ['messagesCount'],
                    dimensions: [],
                    time_dimensions: [
                        { dimension: 'sentDatetime', granularity: 'day' },
                    ],
                    timezone: 'utc',
                    filters: periodFilters,
                    limit: 10000,
                })
            })

            it('timeseries uses the per-dimension metric name when ctx.dimensions=[channel]', () => {
                expect(
                    sentMessagesTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: ['channel'],
                    }).metricName,
                ).toBe(
                    'performance-overview-messages-sent-timeseries-per-channel',
                )
            })
        })
    })
})

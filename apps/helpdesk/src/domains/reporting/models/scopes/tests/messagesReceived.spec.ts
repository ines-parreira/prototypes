import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    messagesReceivedCount,
    messagesReceivedCountQueryV2Factory,
    messagesReceivedPerAgent,
    messagesReceivedPerAgentQueryV2Factory,
    messagesReceivedPerChannel,
    messagesReceivedPerChannelQueryV2Factory,
    messagesReceivedTimeSeries,
    messagesReceivedTimeSeriesQueryV2Factory,
} from 'domains/reporting/models/scopes/messagesReceived'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('messagesReceivedScope', () => {
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

    describe('messagesReceivedCount', () => {
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
            metricName: 'support-performance-messages-received',
            scope: 'messages-received',
            time_dimensions: [
                {
                    dimension: 'sentDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual = messagesReceivedCount.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = messagesReceivedCount.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['messagesCount', 'desc']],
            })
        })
    })

    describe('messagesReceivedTimeSeries', () => {
        it('creates query', () => {
            const actual = messagesReceivedTimeSeries.build(context)

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
                metricName: 'support-performance-messages-received-time-series',
                scope: 'messages-received',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('messagesReceivedPerAgent', () => {
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
            metricName: 'support-performance-messages-received-per-agent',
            scope: 'messages-received',
            time_dimensions: [
                {
                    dimension: 'sentDatetime',
                    granularity: 'day',
                },
            ],
            limit: 10000,
        }

        it('creates query', () => {
            const actual = messagesReceivedPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = messagesReceivedPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['messagesCount', 'desc']],
            })
        })
    })

    describe('messagesReceivedPerChannel', () => {
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
            metricName: 'support-performance-messages-received-per-channel',
            scope: 'messages-received',
            time_dimensions: [
                {
                    dimension: 'sentDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual = messagesReceivedPerChannel.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = messagesReceivedPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['messagesCount', 'desc']],
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('messagesReceivedCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    messagesReceivedCountQueryV2Factory(context)
                const buildResult = messagesReceivedCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('messagesReceivedTimeSeriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    messagesReceivedTimeSeriesQueryV2Factory(context)
                const buildResult = messagesReceivedTimeSeries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    messagesReceivedTimeSeriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'sentDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('messagesReceivedPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    messagesReceivedPerAgentQueryV2Factory(context)
                const buildResult = messagesReceivedPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    messagesReceivedPerAgentQueryV2Factory(contextWithSort)
                const buildResult =
                    messagesReceivedPerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['messagesCount', 'asc']])
            })
        })

        describe('messagesReceivedPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    messagesReceivedPerChannelQueryV2Factory(context)
                const buildResult = messagesReceivedPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    messagesReceivedPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    messagesReceivedPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['messagesCount', 'desc']])
            })
        })
    })
})

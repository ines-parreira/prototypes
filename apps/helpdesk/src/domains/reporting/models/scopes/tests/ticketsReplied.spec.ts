import {
    ticketsRepliedCount,
    ticketsRepliedCountPerAgent,
    ticketsRepliedCountPerAgentQueryV2Factory,
    ticketsRepliedCountPerChannel,
    ticketsRepliedCountPerChannelQueryV2Factory,
    ticketsRepliedCountQueryV2Factory,
    ticketsRepliedTimeseries,
    ticketsRepliedTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsReplied'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('ticketsRepliedScope', () => {
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

    describe('ticketsRepliedCount', () => {
        it('creates query', () => {
            const actual = ticketsRepliedCount.build(context)

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
                ],
                metricName: 'support-performance-tickets-replied',
                scope: 'tickets-replied',
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

    describe('ticketsRepliedTimeseries', () => {
        it('creates query', () => {
            const actual = ticketsRepliedTimeseries.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                metricName: 'support-performance-tickets-replied-time-series',
                scope: 'tickets-replied',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketsRepliedCountPerAgent', () => {
        it('creates query', () => {
            const actual = ticketsRepliedCountPerAgent.build({
                ...context,
                granularity: undefined,
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
                ],
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-tickets-replied-per-agent',
                scope: 'tickets-replied',
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = ticketsRepliedCountPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
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
                ],
                order: [['ticketCount', 'desc']],
                metricName: 'support-performance-tickets-replied-per-agent',
                scope: 'tickets-replied',
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

    describe('ticketsRepliedCountPerChannel', () => {
        it('creates query', () => {
            const actual = ticketsRepliedCountPerChannel.build(context)

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
                ],
                metricName: 'support-performance-tickets-replied-per-channel',
                scope: 'tickets-replied',
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
        describe('ticketsRepliedCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = ticketsRepliedCountQueryV2Factory(context)
                const buildResult = ticketsRepliedCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('ticketsRepliedTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    ticketsRepliedTimeseriesQueryV2Factory(context)
                const buildResult = ticketsRepliedTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    ticketsRepliedTimeseriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'sentDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('ticketsRepliedCountPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    ticketsRepliedCountPerAgentQueryV2Factory(context)
                const buildResult = ticketsRepliedCountPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    ticketsRepliedCountPerAgentQueryV2Factory(contextWithSort)
                const buildResult =
                    ticketsRepliedCountPerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'desc']])
            })
        })

        describe('ticketsRepliedCountPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    ticketsRepliedCountPerChannelQueryV2Factory(context)
                const buildResult = ticketsRepliedCountPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    ticketsRepliedCountPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    ticketsRepliedCountPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'desc']])
            })
        })
    })
})

import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    oneTouchTickets,
    oneTouchTicketsPerAgent,
    oneTouchTicketsPerAgentQueryV2Factory,
    oneTouchTicketsPerChannel,
    oneTouchTicketsPerChannelQueryV2Factory,
    oneTouchTicketsQueryV2Factory,
    oneTouchTicketsTimeseries,
    oneTouchTicketsTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/oneTouchTickets'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('oneTouchTicketsScope', () => {
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

    describe('oneTouchTickets', () => {
        it('creates query', () => {
            const actual = oneTouchTickets.build(context)

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
                metricName: 'support-performance-one-touch-tickets',
                scope: 'one-touch-tickets',
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
            const actual = oneTouchTickets.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

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
                order: [['ticketId', 'desc']],
                metricName: 'support-performance-one-touch-tickets',
                scope: 'one-touch-tickets',
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

    describe('oneTouchTicketsTimeseries', () => {
        it('creates query', () => {
            const actual = oneTouchTicketsTimeseries.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                ],
                metricName: 'support-performance-one-touch-tickets-time-series',
                scope: 'one-touch-tickets',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('oneTouchTicketsPerAgent', () => {
        it('creates query', () => {
            const actual = oneTouchTicketsPerAgent.build(context)

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
                metricName: 'support-performance-one-touch-tickets-per-agent',
                scope: 'one-touch-tickets',
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
            const actual = oneTouchTicketsPerAgent.build({
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
                ],
                order: [['ticketId', 'asc']],
                metricName: 'support-performance-one-touch-tickets-per-agent',
                scope: 'one-touch-tickets',
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

    describe('oneTouchTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = oneTouchTicketsPerChannel.build(context)

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
                metricName: 'support-performance-one-touch-tickets-per-channel',
                scope: 'one-touch-tickets',
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
            const actual = oneTouchTicketsPerChannel.build({
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
                ],
                order: [['ticketId', 'desc']],
                metricName: 'support-performance-one-touch-tickets-per-channel',
                scope: 'one-touch-tickets',
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
        describe('oneTouchTicketsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = oneTouchTicketsQueryV2Factory(context)
                const buildResult = oneTouchTickets.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    oneTouchTicketsQueryV2Factory(contextWithSort)
                const buildResult = oneTouchTickets.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('oneTouchTicketsTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    oneTouchTicketsTimeseriesQueryV2Factory(context)
                const buildResult = oneTouchTicketsTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    oneTouchTicketsTimeseriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'closedDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('oneTouchTicketsPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    oneTouchTicketsPerAgentQueryV2Factory(context)
                const buildResult = oneTouchTicketsPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    oneTouchTicketsPerAgentQueryV2Factory(contextWithSort)
                const buildResult =
                    oneTouchTicketsPerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('oneTouchTicketsPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    oneTouchTicketsPerChannelQueryV2Factory(context)
                const buildResult = oneTouchTicketsPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    oneTouchTicketsPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    oneTouchTicketsPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

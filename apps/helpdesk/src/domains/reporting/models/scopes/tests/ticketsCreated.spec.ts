import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    createdTicketsCount,
    createdTicketsCountQueryV2Factory,
    createdTicketsPerChannel,
    createdTicketsPerChannelQueryV2Factory,
    createdTicketsTimeseries,
    createdTicketsTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsCreated'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('ticketsCreatedScope', () => {
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

    describe('createdTicketsCount', () => {
        it('creates query', () => {
            const actual = createdTicketsCount.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                timezone: 'utc',
                metricName: 'support-performance-tickets-created',
                scope: 'tickets-created',
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
            const actual = createdTicketsCount.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['ticketCount'],
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
                timezone: 'utc',
                metricName: 'support-performance-tickets-created',
                scope: 'tickets-created',
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

    describe('createdTicketsTimeseries', () => {
        it('creates query', () => {
            const actual = createdTicketsTimeseries.build(context)

            const expected = {
                measures: ['ticketCount'],
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
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
                order: [['createdDatetime', 'asc']],
                metricName: 'support-performance-tickets-created-time-series',
                scope: 'tickets-created',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('createdTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = createdTicketsPerChannel.build(context)

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
                metricName: 'support-performance-tickets-created-per-channel',
                scope: 'tickets-created',
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
            const actual = createdTicketsPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Asc,
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
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-tickets-created-per-channel',
                scope: 'tickets-created',
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
        describe('createdTicketsCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = createdTicketsCountQueryV2Factory(context)
                const buildResult = createdTicketsCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    createdTicketsCountQueryV2Factory(contextWithSort)
                const buildResult = createdTicketsCount.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'desc']])
            })
        })

        describe('createdTicketsTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    createdTicketsTimeseriesQueryV2Factory(context)
                const buildResult = createdTicketsTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    createdTicketsTimeseriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'week',
                    },
                ])
                expect(factoryResult.order).toEqual([
                    ['createdDatetime', 'asc'],
                ])
            })
        })

        describe('createdTicketsPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    createdTicketsPerChannelQueryV2Factory(context)
                const buildResult = createdTicketsPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    createdTicketsPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    createdTicketsPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'asc']])
            })
        })
    })
})

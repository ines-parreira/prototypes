import {
    oneTouchTickets,
    oneTouchTicketsPerAgent,
    oneTouchTicketsPerChannel,
    oneTouchTicketsTimeseries,
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
            const actual = oneTouchTickets.build(context, {})

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
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = oneTouchTickets.build(context, {
                sortDirection: 'desc',
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
                order: [['tickets', 'desc']],
                metricName: 'support-performance-one-touch-tickets',
                scope: 'one-touch-tickets',
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
            const actual = oneTouchTicketsPerAgent.build(context, {})

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['agents'],
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
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = oneTouchTicketsPerAgent.build(context, {
                sortDirection: 'asc',
            })

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['agents'],
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
                order: [['tickets', 'asc']],
                metricName: 'support-performance-one-touch-tickets-per-agent',
                scope: 'one-touch-tickets',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('oneTouchTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = oneTouchTicketsPerChannel.build(context, {})

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['channels'],
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
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = oneTouchTicketsPerChannel.build(context, {
                sortDirection: 'desc',
            })

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['channels'],
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
                order: [['tickets', 'desc']],
                metricName: 'support-performance-one-touch-tickets-per-channel',
                scope: 'one-touch-tickets',
            }

            expect(actual).toEqual(expected)
        })
    })
})

import {
    closedTicketsCount,
    closedTicketsPerAgent,
    closedTicketsPerChannel,
    closedTicketsTimeseries,
} from 'domains/reporting/models/scopes/ticketsClosed'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('ticketsClosedScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00',
            end_datetime: '2025-09-03T23:59:59',
        },
    }

    const timezone = 'utc'

    const granularity = 'day' as AggregationWindow

    const context = {
        filters,
        timezone,
        granularity,
    }

    describe('closedTicketsCount', () => {
        it('creates query', () => {
            const actual = closedTicketsCount.build(context)

            const expected = {
                measures: ['ticketCount'],
                timezone: 'utc',
                filters: [
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                metricName: 'support-performance-closed-tickets-time-series',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsPerAgent', () => {
        it('creates query', () => {
            const actual = closedTicketsPerAgent.build(context, {})

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['agents'],
                timezone: 'utc',
                filters: [
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                metricName: 'support-performance-closed-tickets-per-agent',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = closedTicketsPerAgent.build(context, {
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-closed-tickets-per-agent',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = closedTicketsPerChannel.build(context, {})

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['channels'],
                timezone: 'utc',
                filters: [
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                metricName: 'support-performance-closed-tickets-per-channel',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = closedTicketsPerChannel.build(context, {
                sortDirection: 'asc',
            })

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['channels'],
                timezone: 'utc',
                filters: [
                    {
                        member: 'periodStart',
                        operator: 'afterDate',
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-closed-tickets-per-channel',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })
    })
})

import {
    createdTicketsCount,
    createdTicketsPerChannel,
    createdTicketsTimeseries,
} from 'domains/reporting/models/scopes/ticketsCreated'
import {
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
            const actual = createdTicketsCount.build(context, {})

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
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = createdTicketsCount.build(context, {
                sortDirection: 'desc',
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('createdTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = createdTicketsPerChannel.build(context, {})

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
                metricName: 'support-performance-tickets-created-per-channel',
                scope: 'tickets-created',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = createdTicketsPerChannel.build(context, {
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
            }

            expect(actual).toEqual(expected)
        })
    })
})

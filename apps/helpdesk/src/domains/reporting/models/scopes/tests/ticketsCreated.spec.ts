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

    describe('createdTicketsCount', () => {
        it('creates query', () => {
            const actual = createdTicketsCount.build(context, {})

            const expected = {
                measures: ['ticketCount'],
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
                timezone: 'utc',
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                order: [['ticketCount', 'desc']],
                timezone: 'utc',
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                order: [['createdDatetime', 'asc']],
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                order: [['ticketCount', 'asc']],
                scope: 'tickets-created',
            }

            expect(actual).toEqual(expected)
        })
    })
})

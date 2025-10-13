import {
    openTicketsCount,
    openTicketsCountPerAgent,
    openTicketsCountPerChannel,
    openTicketsTimeseries,
} from 'domains/reporting/models/scopes/ticketsReplied'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

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

    describe('openTicketsCount', () => {
        it('creates query', () => {
            const actual = openTicketsCount.build(context)

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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('openTicketsTimeseries', () => {
        it('creates query', () => {
            const actual = openTicketsTimeseries.build(context)

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
                metricName: 'support-performance-tickets-replied-time-series',
                scope: 'tickets-replied',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('openTicketsCountPerAgent', () => {
        it('creates query', () => {
            const actual = openTicketsCountPerAgent.build(context, {
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
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-tickets-replied-per-agent',
                scope: 'tickets-replied',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = openTicketsCountPerAgent.build(context, {
                sortDirection: 'desc',
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
                order: [['ticketCount', 'desc']],
                metricName: 'support-performance-tickets-replied-per-agent',
                scope: 'tickets-replied',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('openTicketsCountPerChannel', () => {
        it('creates query', () => {
            const actual = openTicketsCountPerChannel.build(context, {
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
                metricName: 'support-performance-tickets-replied-per-channel',
                scope: 'tickets-replied',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = openTicketsCountPerChannel.build(context, {
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
                order: [['ticketCount', 'desc']],
                metricName: 'support-performance-tickets-replied-per-channel',
                scope: 'tickets-replied',
            }

            expect(actual).toEqual(expected)
        })
    })
})

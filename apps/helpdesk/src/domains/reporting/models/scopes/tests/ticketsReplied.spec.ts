import {
    ticketsRepliedCount,
    ticketsRepliedCountPerAgent,
    ticketsRepliedCountPerChannel,
    ticketsRepliedTimeseries,
} from 'domains/reporting/models/scopes/ticketsReplied'
import {
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
        sortDirection: OrderDirection.Asc,
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
                        dimension: 'createdDatetime',
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

    describe('ticketsRepliedCountPerAgent', () => {
        it('creates query', () => {
            const actual = ticketsRepliedCountPerAgent.build({
                ...context,
                granularity: undefined,
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
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
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
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-tickets-replied-per-channel',
                scope: 'tickets-replied',
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
})

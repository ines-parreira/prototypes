import {
    medianFirstResponseTime,
    medianFirstResponseTimePerAgent,
    medianFirstResponseTimePerChannel,
} from 'domains/reporting/models/scopes/firstResponseTime'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('firstResponseTimeScope', () => {
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

    describe('medianFirstResponseTime', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTime.build(context, {})

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTime.build(context, {
                sortDirection: 'asc',
            })

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                order: [['medianFirstResponseTime', 'asc']],
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstResponseTimePerAgent', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTimePerAgent.build(context, {})

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTimePerAgent.build(context, {
                sortDirection: 'desc',
            })

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                order: [['medianFirstResponseTime', 'desc']],
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianFirstResponseTimePerChannel', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTimePerChannel.build(context, {})

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTimePerChannel.build(context, {
                sortDirection: 'asc',
            })

            const expected = {
                measures: ['medianFirstResponseTime'],
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
                order: [['medianFirstResponseTime', 'asc']],
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })
    })
})

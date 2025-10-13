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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                metricName: 'support-performance-median-first-response-time',
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                order: [['medianFirstResponseTime', 'asc']],
                metricName: 'support-performance-median-first-response-time',
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                metricName:
                    'support-performance-median-first-response-time-per-agent',
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                order: [['medianFirstResponseTime', 'desc']],
                metricName:
                    'support-performance-median-first-response-time-per-agent',
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                metricName:
                    'support-performance-median-first-response-time-per-channel',
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                order: [['medianFirstResponseTime', 'asc']],
                metricName:
                    'support-performance-median-first-response-time-per-channel',
                scope: 'first-response-time',
            }

            expect(actual).toEqual(expected)
        })
    })
})

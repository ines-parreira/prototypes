import {
    medianResolutionTime,
    medianResolutionTimePerAgent,
    medianResolutionTimePerChannel,
} from 'domains/reporting/models/scopes/resolutionTime'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('resolutionTimeScope', () => {
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

    describe('medianResolutionTime', () => {
        it('creates query', () => {
            const actual = medianResolutionTime.build(context)

            const expected = {
                measures: ['medianResolutionTime'],
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
                metricName: 'support-performance-median-resolution-time',
                scope: 'resolution-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianResolutionTimePerAgent', () => {
        it('creates query', () => {
            const actual = medianResolutionTimePerAgent.build(context)

            const expected = {
                measures: ['medianResolutionTime'],
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
                    'support-performance-median-resolution-time-per-agent',
                scope: 'resolution-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('medianResolutionTimePerChannel', () => {
        it('creates query', () => {
            const actual = medianResolutionTimePerChannel.build(context)

            const expected = {
                measures: ['medianResolutionTime'],
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
                    'support-performance-median-resolution-time-per-channel',
                scope: 'resolution-time',
            }

            expect(actual).toEqual(expected)
        })
    })
})

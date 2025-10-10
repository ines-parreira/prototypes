import {
    onlineTime,
    onlineTimePerAgent,
} from 'domains/reporting/models/scopes/onlineTime'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('onlineTimeScope', () => {
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

    describe('onlineTime', () => {
        it('creates query', () => {
            const actual = onlineTime.build(context)

            const expected = {
                measures: ['onlineTime'],
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
                metricName: 'agentxp-online-time',
                scope: 'online-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('onlineTimePerAgent', () => {
        it('creates query', () => {
            const actual = onlineTimePerAgent.build(context)

            const expected = {
                measures: ['onlineTime'],
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
                metricName: 'agentxp-online-time-per-agent',
                scope: 'online-time',
            }

            expect(actual).toEqual(expected)
        })
    })
})

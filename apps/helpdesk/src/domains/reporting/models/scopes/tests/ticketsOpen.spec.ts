import {
    openTicketsCount,
    openTicketsCountQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsOpen'
import { StatsFilters } from 'domains/reporting/models/stat/types'

describe('ticketsOpenScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const timezone = 'utc'

    const context = {
        filters,
        timezone,
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
                metricName: 'support-performance-open-tickets',
                scope: 'tickets-open',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('openTicketsCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = openTicketsCountQueryV2Factory(context)
                const buildResult = openTicketsCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

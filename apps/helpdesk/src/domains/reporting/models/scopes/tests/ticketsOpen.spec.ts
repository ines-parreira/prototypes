import { openTicketsCount } from 'domains/reporting/models/scopes/ticketsOpen'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('ticketsOpenScope', () => {
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
                        values: ['2025-09-03T00:00:00'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59'],
                    },
                ],
                metricName: 'support-performance-open-tickets',
                scope: 'tickets-open',
            }

            expect(actual).toEqual(expected)
        })
    })
})

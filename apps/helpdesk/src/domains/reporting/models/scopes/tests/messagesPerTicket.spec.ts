import { messagesPerTicketCount } from 'domains/reporting/models/scopes/messagesPerTicket'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('messagesPerTicketScope', () => {
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

    describe('messagesPerTicketCount', () => {
        it('creates query', () => {
            const actual = messagesPerTicketCount.build(context)

            const expected = {
                measures: ['messagesAverage'],
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
                scope: 'messages-per-ticket',
            }

            expect(actual).toEqual(expected)
        })
    })
})

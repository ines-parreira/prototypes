import {
    messagesPerTicketCount,
    messagesPerTicketCountQueryV2Factory,
} from 'domains/reporting/models/scopes/messagesPerTicket'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('messagesPerTicketScope', () => {
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                metricName: 'support-performance-messages-per-ticket',
                scope: 'messages-per-ticket',
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

    describe('QueryV2Factory methods', () => {
        describe('messagesPerTicketCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    messagesPerTicketCountQueryV2Factory(context)
                const buildResult = messagesPerTicketCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

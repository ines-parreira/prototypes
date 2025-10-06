import {
    sentMessagesCount,
    sentMessagesPerAgent,
    sentMessagesPerChannel,
    sentMessagesTimeseries,
} from 'domains/reporting/models/scopes/messagesSent'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('messagesSentScope', () => {
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

    describe('sentMessagesCount', () => {
        it('creates query', () => {
            const actual = sentMessagesCount.build(context)

            const expected = {
                measures: ['messagesCount'],
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
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesTimeseries', () => {
        it('creates query', () => {
            const actual = sentMessagesTimeseries.build(context)

            const expected = {
                measures: ['messagesCount'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
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
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesPerAgent', () => {
        it('creates query', () => {
            const actual = sentMessagesPerAgent.build(context, {
                sortDirection: 'asc',
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'asc']],
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = sentMessagesPerAgent.build(context, {
                sortDirection: 'desc',
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'desc']],
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesPerChannel', () => {
        it('creates query', () => {
            const actual = sentMessagesPerChannel.build(context, {
                sortDirection: 'asc',
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'asc']],
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = sentMessagesPerChannel.build(context, {
                sortDirection: 'desc',
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'desc']],
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })
    })
})

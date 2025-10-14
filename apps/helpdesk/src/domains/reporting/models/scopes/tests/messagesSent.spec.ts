import { OrderDirection } from '@gorgias/helpdesk-types'

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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                metricName: 'support-performance-messages-sent',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
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
                        values: ['2025-09-03T00:00:00.000'],
                    },
                    {
                        member: 'periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-03T23:59:59.000'],
                    },
                ],
                metricName: 'support-performance-messages-sent-time-series',
                scope: 'messages-sent',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesPerAgent', () => {
        it('creates query', () => {
            const actual = sentMessagesPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'asc']],
                metricName: 'support-performance-messages-sent-per-agent',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = sentMessagesPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'desc']],
                metricName: 'support-performance-messages-sent-per-agent',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('sentMessagesPerChannel', () => {
        it('creates query', () => {
            const actual = sentMessagesPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'asc']],
                metricName: 'support-performance-messages-sent-per-channel',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = sentMessagesPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['messagesCount'],
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
                order: [['messagesCount', 'desc']],
                metricName: 'support-performance-messages-sent-per-channel',
                scope: 'messages-sent',
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })
})

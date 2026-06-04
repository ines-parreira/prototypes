import {
    messagesPerTicketBreakdownQueryFactoryV2,
    messagesPerTicketCount,
    messagesPerTicketCountQueryV2Factory,
    messagesPerTicketTimeseriesQueryFactoryV2,
    messagesPerTicketValueQueryFactoryV2,
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
                measures: ['averageMessagesCount'],
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

        describe('performance overview messages per ticket triplet', () => {
            const periodFilters = [
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
            ]

            it('value returns measures + period filters with auto-injected time_dimensions', () => {
                expect(messagesPerTicketValueQueryFactoryV2(context)).toEqual({
                    metricName:
                        'performance-overview-messages-per-ticket-value',
                    scope: 'messages-per-ticket',
                    measures: ['averageMessagesCount'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                })
            })

            it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
                expect(
                    messagesPerTicketBreakdownQueryFactoryV2({
                        ...context,
                        dimensions: ['integrationId'],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-messages-per-ticket-breakdown',
                    scope: 'messages-per-ticket',
                    measures: ['averageMessagesCount'],
                    dimensions: ['integrationId'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                    limit: 10000,
                })
            })

            it.each([
                [
                    'channel',
                    'performance-overview-messages-per-ticket-breakdown-per-channel',
                ],
                [
                    'agentId',
                    'performance-overview-messages-per-ticket-breakdown-per-agent',
                ],
            ] as const)(
                'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, expectedMetricName) => {
                    expect(
                        messagesPerTicketBreakdownQueryFactoryV2({
                            ...context,
                            dimensions: [dimension],
                        }).metricName,
                    ).toBe(expectedMetricName)
                },
            )

            it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
                expect(
                    messagesPerTicketBreakdownQueryFactoryV2({
                        ...context,
                        dimensions: ['channel', 'agentId'],
                    }).metricName,
                ).toBe('performance-overview-messages-per-ticket-breakdown')
            })

            it('timeseries pins createdDatetime time dimension and adds limit', () => {
                expect(
                    messagesPerTicketTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-messages-per-ticket-timeseries',
                    scope: 'messages-per-ticket',
                    measures: ['averageMessagesCount'],
                    dimensions: [],
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                    timezone: 'utc',
                    filters: periodFilters,
                    limit: 10000,
                })
            })

            it('timeseries uses the per-dimension metric name when ctx.dimensions=[channel]', () => {
                expect(
                    messagesPerTicketTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: ['channel'],
                    }).metricName,
                ).toBe(
                    'performance-overview-messages-per-ticket-timeseries-per-channel',
                )
            })
        })
    })
})

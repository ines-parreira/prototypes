import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    humanResponseTimeAfterAiHandoff,
    humanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2,
    humanResponseTimeAfterAiHandoffPerAgent,
    humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory,
    humanResponseTimeAfterAiHandoffPerChannel,
    humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory,
    humanResponseTimeAfterAiHandoffQueryV2Factory,
    humanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
    humanResponseTimeAfterAiHandoffValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('humanResponseTimeAfterAiHandoffScope', () => {
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

    describe('humanResponseTimeAfterAiHandoff', () => {
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
            metricName:
                'support-performance-human-response-time-after-ai-handoff',
            scope: 'human-first-response-time',
            time_dimensions: [
                {
                    dimension: 'firstAgentMessageDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual = humanResponseTimeAfterAiHandoff.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = humanResponseTimeAfterAiHandoff.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianFirstResponseTime', 'desc']],
            })
        })
    })

    describe('humanResponseTimeAfterAiHandoffPerAgent', () => {
        const expected = {
            measures: ['medianFirstResponseTime'],
            dimensions: ['agentId'],
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
                'support-performance-human-response-time-after-ai-handoff-per-agent',
            scope: 'human-first-response-time',
            time_dimensions: [
                {
                    dimension: 'firstAgentMessageDatetime',
                    granularity: 'day',
                },
            ],
            limit: 10000,
        }

        it('creates query', () => {
            const actual =
                humanResponseTimeAfterAiHandoffPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = humanResponseTimeAfterAiHandoffPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianFirstResponseTime', 'desc']],
            })
        })
    })

    describe('humanResponseTimeAfterAiHandoffPerChannel', () => {
        const expected = {
            measures: ['medianFirstResponseTime'],
            dimensions: ['channel'],
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
                'support-performance-human-response-time-after-ai-handoff-per-channel',
            scope: 'human-first-response-time',
            time_dimensions: [
                {
                    dimension: 'firstAgentMessageDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual =
                humanResponseTimeAfterAiHandoffPerChannel.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = humanResponseTimeAfterAiHandoffPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianFirstResponseTime', 'desc']],
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('medianFirstResponseTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    humanResponseTimeAfterAiHandoffQueryV2Factory(context)
                const buildResult =
                    humanResponseTimeAfterAiHandoff.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory(
                        context,
                    )
                const buildResult =
                    humanResponseTimeAfterAiHandoffPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory(
                        context,
                    )
                const buildResult =
                    humanResponseTimeAfterAiHandoffPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('performance overview human response time after AI handoff triplet', () => {
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
                expect(
                    humanResponseTimeAfterAiHandoffValueQueryFactoryV2(context),
                ).toEqual({
                    metricName:
                        'performance-overview-human-response-time-after-ai-handoff-value',
                    scope: 'human-first-response-time',
                    measures: ['medianFirstResponseTime'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        {
                            dimension: 'firstAgentMessageDatetime',
                            granularity: 'day',
                        },
                    ],
                })
            })

            it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
                expect(
                    humanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2.build(
                        {
                            ...context,
                            dimensions: ['integrationId'],
                        },
                    ),
                ).toEqual({
                    metricName:
                        'performance-overview-human-response-time-after-ai-handoff-breakdown',
                    scope: 'human-first-response-time',
                    measures: ['medianFirstResponseTime'],
                    dimensions: ['integrationId'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        {
                            dimension: 'firstAgentMessageDatetime',
                            granularity: 'day',
                        },
                    ],
                })
            })

            it.each([
                [
                    'channel',
                    'performance-overview-human-response-time-after-ai-handoff-breakdown-per-channel',
                ],
                [
                    'agentId',
                    'performance-overview-human-response-time-after-ai-handoff-breakdown-per-agent',
                ],
            ] as const)(
                'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, expectedMetricName) => {
                    expect(
                        humanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2.build(
                            {
                                ...context,
                                dimensions: [dimension],
                            },
                        ).metricName,
                    ).toBe(expectedMetricName)
                },
            )

            it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
                expect(
                    humanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2.build(
                        {
                            ...context,
                            dimensions: ['channel', 'agentId'],
                        },
                    ).metricName,
                ).toBe(
                    'performance-overview-human-response-time-after-ai-handoff-breakdown',
                )
            })

            it('timeseries pins createdDatetime time dimension and adds limit', () => {
                expect(
                    humanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2({
                        ...context,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-human-response-time-after-ai-handoff-timeseries',
                    scope: 'human-first-response-time',
                    measures: ['medianFirstResponseTime'],
                    dimensions: [],
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                    timezone: 'utc',
                    filters: periodFilters,
                    limit: 10000,
                })
            })
        })
    })
})

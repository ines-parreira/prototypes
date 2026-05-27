import {
    aiAgentAllAgentsResolutionTime,
    aiAgentAllAgentsResolutionTimeQueryV2Factory,
    medianResolutionTime,
    medianResolutionTimePerAgent,
    medianResolutionTimePerAgentQueryV2Factory,
    medianResolutionTimePerChannel,
    medianResolutionTimePerChannelQueryV2Factory,
    medianResolutionTimeQueryV2Factory,
    resolutionTimeBreakdownQueryFactoryV2,
    resolutionTimeTimeseriesQueryFactoryV2,
    resolutionTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/resolutionTime'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('resolutionTimeScope', () => {
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
        const expected = {
            measures: ['medianResolutionTime'],
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
            limit: 10000,
            metricName: 'support-performance-median-resolution-time-per-agent',
            scope: 'resolution-time',
        }

        it('creates query', () => {
            const actual = medianResolutionTimePerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('creates query with sort direction', () => {
            const actual = medianResolutionTimePerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianResolutionTime', 'asc']],
            })
        })
    })

    describe('medianResolutionTimePerChannel', () => {
        it('creates query', () => {
            const actual = medianResolutionTimePerChannel.build(context)

            const expected = {
                measures: ['medianResolutionTime'],
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
                    'support-performance-median-resolution-time-per-channel',
                scope: 'resolution-time',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('medianResolutionTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResolutionTimeQueryV2Factory(context)
                const buildResult = medianResolutionTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('medianResolutionTimePerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResolutionTimePerAgentQueryV2Factory(context)
                const buildResult = medianResolutionTimePerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('medianResolutionTimePerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResolutionTimePerChannelQueryV2Factory(context)
                const buildResult =
                    medianResolutionTimePerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('performance overview resolution time triplet', () => {
            const granularContext = {
                ...context,
                granularity: 'day' as AggregationWindow,
            }

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
                    resolutionTimeValueQueryFactoryV2(granularContext),
                ).toEqual({
                    metricName: 'performance-overview-resolution-time-value',
                    scope: 'resolution-time',
                    measures: ['medianResolutionTime'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                })
            })

            it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
                expect(
                    resolutionTimeBreakdownQueryFactoryV2.build({
                        ...granularContext,
                        dimensions: ['integrationId'],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-resolution-time-breakdown',
                    scope: 'resolution-time',
                    measures: ['medianResolutionTime'],
                    dimensions: ['integrationId'],
                    timezone: 'utc',
                    filters: periodFilters,
                    time_dimensions: [
                        { dimension: 'createdDatetime', granularity: 'day' },
                    ],
                })
            })

            it.each([
                [
                    'channel',
                    'performance-overview-resolution-time-breakdown-per-channel',
                ],
                [
                    'agentId',
                    'performance-overview-resolution-time-breakdown-per-agent',
                ],
            ] as const)(
                'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
                (dimension, expectedMetricName) => {
                    expect(
                        resolutionTimeBreakdownQueryFactoryV2.build({
                            ...granularContext,
                            dimensions: [dimension],
                        }).metricName,
                    ).toBe(expectedMetricName)
                },
            )

            it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
                expect(
                    resolutionTimeBreakdownQueryFactoryV2.build({
                        ...granularContext,
                        dimensions: ['channel', 'agentId'],
                    }).metricName,
                ).toBe('performance-overview-resolution-time-breakdown')
            })

            it('timeseries pins createdDatetime time dimension and adds limit', () => {
                expect(
                    resolutionTimeTimeseriesQueryFactoryV2({
                        ...granularContext,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName:
                        'performance-overview-resolution-time-timeseries',
                    scope: 'resolution-time',
                    measures: ['medianResolutionTime'],
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
                    resolutionTimeTimeseriesQueryFactoryV2({
                        ...granularContext,
                        dimensions: ['channel'],
                    }).metricName,
                ).toBe(
                    'performance-overview-resolution-time-timeseries-per-channel',
                )
            })
        })

        describe('aiAgentAllAgentsResolutionTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAllAgentsResolutionTimeQueryV2Factory(context)
                const buildResult =
                    aiAgentAllAgentsResolutionTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('creates query with correct metric name and measures', () => {
                const result =
                    aiAgentAllAgentsResolutionTimeQueryV2Factory(context)

                expect(result.metricName).toBe(
                    'ai-agent-all-agents-resolution-time',
                )
                expect(result.measures).toEqual(['medianResolutionTime'])
                expect(result.scope).toBe('resolution-time')
            })

            it('includes period filters', () => {
                const result =
                    aiAgentAllAgentsResolutionTimeQueryV2Factory(context)

                expect(result.filters).toEqual([
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
                ])
            })
        })
    })
})

import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    medianFirstResponseTime,
    medianFirstResponseTimePerAgent,
    medianFirstResponseTimePerAgentQueryV2Factory,
    medianFirstResponseTimePerChannel,
    medianFirstResponseTimePerChannelQueryV2Factory,
    medianFirstResponseTimeQueryV2Factory,
} from 'domains/reporting/models/scopes/firstResponseTime'
import {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('firstResponseTimeScope', () => {
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

    describe('medianFirstResponseTime', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTime.build(context)

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
                metricName: 'support-performance-median-first-response-time',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTime.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

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
                order: [['medianFirstResponseTime', 'asc']],
                metricName: 'support-performance-median-first-response-time',
                scope: 'first-response-time',
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

    describe('medianFirstResponseTimePerAgent', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTimePerAgent.build(context)

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
                    'support-performance-median-first-response-time-per-agent',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTimePerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

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
                order: [['medianFirstResponseTime', 'desc']],
                metricName:
                    'support-performance-median-first-response-time-per-agent',
                scope: 'first-response-time',
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

    describe('medianFirstResponseTimePerChannel', () => {
        it('creates query', () => {
            const actual = medianFirstResponseTimePerChannel.build(context)

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
                    'support-performance-median-first-response-time-per-channel',
                scope: 'first-response-time',
                time_dimensions: [
                    {
                        dimension: 'createdDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianFirstResponseTimePerChannel.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

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
                order: [['medianFirstResponseTime', 'asc']],
                metricName:
                    'support-performance-median-first-response-time-per-channel',
                scope: 'first-response-time',
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
        describe('medianFirstResponseTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianFirstResponseTimeQueryV2Factory(context)
                const buildResult = medianFirstResponseTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('supports sorting', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    medianFirstResponseTimeQueryV2Factory(contextWithSort)
                const buildResult =
                    medianFirstResponseTime.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['medianFirstResponseTime', 'desc'],
                ])
            })

            it('supports granularity', () => {
                const contextWithHourlyGranularity = {
                    ...context,
                    granularity: 'hour' as AggregationWindow,
                }

                const factoryResult = medianFirstResponseTimeQueryV2Factory(
                    contextWithHourlyGranularity,
                )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'hour',
                    },
                ])
            })
        })

        describe('medianFirstResponseTimePerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianFirstResponseTimePerAgentQueryV2Factory(context)
                const buildResult =
                    medianFirstResponseTimePerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('supports sorting', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    medianFirstResponseTimePerAgentQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    medianFirstResponseTimePerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['medianFirstResponseTime', 'asc'],
                ])
            })

            it('supports granularity', () => {
                const contextWithWeeklyGranularity = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    medianFirstResponseTimePerAgentQueryV2Factory(
                        contextWithWeeklyGranularity,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('medianFirstResponseTimePerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianFirstResponseTimePerChannelQueryV2Factory(context)
                const buildResult =
                    medianFirstResponseTimePerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('supports sorting', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    medianFirstResponseTimePerChannelQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    medianFirstResponseTimePerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['medianFirstResponseTime', 'desc'],
                ])
            })

            it('supports granularity', () => {
                const contextWithMonthlyGranularity = {
                    ...context,
                    granularity: 'month' as AggregationWindow,
                }

                const factoryResult =
                    medianFirstResponseTimePerChannelQueryV2Factory(
                        contextWithMonthlyGranularity,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'createdDatetime',
                        granularity: 'month',
                    },
                ])
            })
        })
    })
})

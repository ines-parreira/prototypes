import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    medianResponseTime,
    medianResponseTimePerAgent,
    medianResponseTimePerAgentQueryV2Factory,
    medianResponseTimePerChannel,
    medianResponseTimePerChannelQueryV2Factory,
    medianResponseTimeQueryV2Factory,
} from 'domains/reporting/models/scopes/responseTime'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('responseTimeScope', () => {
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

    describe('medianResponseTime', () => {
        const expected = {
            metricName: 'support-performance-median-response-time',
            scope: 'response-time',
            measures: ['medianResponseTime'],
            time_dimensions: [
                {
                    dimension: 'createdDatetime',
                    granularity: 'day',
                },
            ],
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
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = medianResponseTime.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianResponseTime.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianResponseTime', 'desc']],
            })
        })
    })

    describe('medianResponseTimePerAgent', () => {
        const expected = {
            metricName: 'support-performance-median-response-time-per-agent',
            scope: 'response-time',
            measures: ['medianResponseTime'],
            dimensions: ['agentId'],
            time_dimensions: [
                {
                    dimension: 'createdDatetime',
                    granularity: 'day',
                },
            ],
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
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = medianResponseTimePerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianResponseTimePerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianResponseTime', 'desc']],
            })
        })
    })

    describe('medianResponseTimePerChannel', () => {
        const expected = {
            metricName: 'support-performance-median-response-time-per-channel',
            scope: 'response-time',
            measures: ['medianResponseTime'],
            dimensions: ['channel'],
            time_dimensions: [
                {
                    dimension: 'createdDatetime',
                    granularity: 'day',
                },
            ],
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
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = medianResponseTimePerChannel.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = medianResponseTimePerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianResponseTime', 'desc']],
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('medianResponseTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = medianResponseTimeQueryV2Factory(context)
                const buildResult = medianResponseTime.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('medianResponseTimePerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResponseTimePerAgentQueryV2Factory(context)
                const buildResult = medianResponseTimePerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('medianResponseTimePerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    medianResponseTimePerChannelQueryV2Factory(context)
                const buildResult = medianResponseTimePerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

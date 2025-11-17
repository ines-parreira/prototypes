import { OrderDirection } from '@gorgias/helpdesk-types'

import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    closedTicketsCount,
    closedTicketsCountQueryV2Factory,
    closedTicketsPerAgent,
    closedTicketsPerAgentQueryV2Factory,
    closedTicketsPerChannel,
    closedTicketsPerChannelQueryV2Factory,
    closedTicketsTimeseries,
    closedTicketsTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketsClosed'
import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

describe('ticketsClosedScope', () => {
    const filters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
        agents: withDefaultLogicalOperator([123]),
    }

    const timezone = 'utc'

    const granularity = ReportingGranularity.Day as AggregationWindow

    const context = {
        filters,
        timezone,
        granularity,
    }

    describe('closedTicketsCount', () => {
        it('creates query', () => {
            const actual = closedTicketsCount.build(context)

            const expected = {
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsTimeseries', () => {
        it('creates query', () => {
            const actual = closedTicketsTimeseries.build(context)

            const expected = {
                measures: ['ticketCount'],
                order: [['closedDatetime', 'asc']],
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets-time-series',
                scope: 'tickets-closed',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsPerAgent', () => {
        it('creates query', () => {
            const actual = closedTicketsPerAgent.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets-per-agent',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = closedTicketsPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                order: [['ticketCount', 'asc']],
                metricName: 'support-performance-closed-tickets-per-agent',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('closedTicketsPerChannel', () => {
        it('creates query', () => {
            const actual = closedTicketsPerChannel.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                metricName: 'support-performance-closed-tickets-per-channel',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = closedTicketsPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['ticketCount'],
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
                    {
                        member: 'agentId',
                        operator: 'one-of',
                        values: [123],
                    },
                ],
                order: [['ticketCount', 'desc']],
                metricName: 'support-performance-closed-tickets-per-channel',
                scope: 'tickets-closed',
                time_dimensions: [
                    {
                        dimension: 'closedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('closedTicketsCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = closedTicketsCountQueryV2Factory(context)
                const buildResult = closedTicketsCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('closedTicketsTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    closedTicketsTimeseriesQueryV2Factory(context)
                const buildResult = closedTicketsTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    closedTicketsTimeseriesQueryV2Factory(weeklyContext)

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'closedDatetime',
                        granularity: 'week',
                    },
                ])
                expect(factoryResult.order).toEqual([['closedDatetime', 'asc']])
            })
        })

        describe('closedTicketsPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    closedTicketsPerAgentQueryV2Factory(context)
                const buildResult = closedTicketsPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    closedTicketsPerAgentQueryV2Factory(contextWithSort)
                const buildResult = closedTicketsPerAgent.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'asc']])
            })
        })

        describe('closedTicketsPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    closedTicketsPerChannelQueryV2Factory(context)
                const buildResult = closedTicketsPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    closedTicketsPerChannelQueryV2Factory(contextWithSort)
                const buildResult =
                    closedTicketsPerChannel.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['ticketCount', 'desc']])
            })
        })
    })
})

import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    taggedTicketCountTimeseries,
    taggedTicketCountTimeseriesQueryV2Factory,
    tagsTicketCount,
    tagsTicketCountQueryV2Factory,
    tagsTicketCountTimeseries,
    tagsTicketCountTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/tags'
import type {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

describe('tagsScope', () => {
    const filters: StatsFiltersWithLogicalOperator = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const granularity = ReportingGranularity.Day as AggregationWindow
    const context = {
        filters,
        timezone,
        granularity,
    }

    describe('taggedTicketCountTimeseries', () => {
        it('creates query', () => {
            const actual = taggedTicketCountTimeseries.build(context)

            const expected = {
                metricName: 'ticket-insights-tagged-ticket-count-time-series',
                scope: 'tags',
                measures: ['ticketCount'],
                time_dimensions: [
                    {
                        dimension: 'timestamp',
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
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('tagsTicketCount', () => {
        const expected = {
            metricName: 'ticket-insights-tags-ticket-count',
            scope: 'tags',
            measures: ['ticketCount'],
            dimensions: ['tagId'],
            time_dimensions: [
                {
                    dimension: 'timestamp',
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
            limit: 10_000,
        }

        it('creates query', () => {
            const actual = tagsTicketCount.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = tagsTicketCount.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['ticketCount', 'desc']],
            })
        })
    })

    describe('tagsTicketCountTimeseries', () => {
        it('creates query', () => {
            const actual = tagsTicketCountTimeseries.build(context)

            const expected = {
                metricName: 'ticket-insights-tags-ticket-count-time-series',
                scope: 'tags',
                measures: ['ticketCount'],
                dimensions: ['tagId'],
                time_dimensions: [
                    {
                        dimension: 'timestamp',
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
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('tagsTicketCountTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    tagsTicketCountTimeseriesQueryV2Factory(context)
                const buildResult = tagsTicketCountTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('taggedTicketCountTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    taggedTicketCountTimeseriesQueryV2Factory(context)
                const buildResult = taggedTicketCountTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('tagsTicketCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = tagsTicketCountQueryV2Factory(context)
                const buildResult = tagsTicketCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

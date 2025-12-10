import { OrderDirection } from '@gorgias/helpdesk-types'

import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    satisfiedOrBreachedTickets,
    satisfiedOrBreachedTicketsQueryV2Factory,
    satisfiedOrBreachedTicketsTimeseries,
    satisfiedOrBreachedTicketsTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketSLA'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('ticketSLAScope', () => {
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

    describe('satisfiedOrBreachedTickets', () => {
        const expected = {
            metricName: 'sla-satisfied-or-breached-tickets',
            scope: 'ticket-sla',
            measures: ['ticketCount'],
            dimensions: ['status'],
            time_dimensions: [
                {
                    dimension: 'anchorDatetime',
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
            const actual = satisfiedOrBreachedTickets.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = satisfiedOrBreachedTickets.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['ticketCount', 'desc']],
            })
        })

        it('applies SLA UUID filter', () => {
            const actual = satisfiedOrBreachedTickets.build({
                ...context,
                filters: {
                    ...filters,
                    slaPolicies: withLogicalOperator(['policy-uuid-1']),
                },
            })

            expect(actual).toEqual({
                ...expected,
                filters: [
                    ...expected.filters,
                    {
                        member: 'slaPolicyUuid',
                        operator: 'one-of',
                        values: ['policy-uuid-1'],
                    },
                ],
            })
        })
    })

    describe('satisfiedOrBreachedTicketsTimeseries', () => {
        it('creates query', () => {
            const actual = satisfiedOrBreachedTicketsTimeseries.build(context)

            const expected = {
                metricName: 'sla-satisfied-or-breached-tickets-time-series',
                scope: 'ticket-sla',
                measures: ['ticketCount'],
                dimensions: ['status'],
                time_dimensions: [
                    {
                        dimension: 'anchorDatetime',
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
                    {
                        member: 'status',
                        operator: 'one-of',
                        values: ['SATISFIED', 'BREACHED'],
                    },
                ],
                timezone: 'utc',
                limit: 10000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('satisfiedOrBreachedTicketsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    satisfiedOrBreachedTicketsQueryV2Factory(context)
                const buildResult = satisfiedOrBreachedTickets.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('satisfiedOrBreachedTicketsTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    satisfiedOrBreachedTicketsTimeseriesQueryV2Factory(context)
                const buildResult =
                    satisfiedOrBreachedTicketsTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

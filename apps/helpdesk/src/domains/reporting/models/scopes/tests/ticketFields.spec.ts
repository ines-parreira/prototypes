import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    ticketFieldsCount,
    ticketFieldsCountPerFieldValue,
    ticketFieldsCountPerFieldValueQueryV2Factory,
    ticketFieldsCountPerFieldValueTimeSeries,
    ticketFieldsCountPerFieldValueTimeSeriesQueryV2Factory,
    ticketFieldsCountQueryV2Factory,
} from 'domains/reporting/models/scopes/ticketFields'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('ticketFieldsScope', () => {
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

    describe('ticketFieldsCount', () => {
        it('creates query without sorting', () => {
            const actual = ticketFieldsCount.build(context)

            const expected = {
                measures: ['ticketCount'],
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
                metricName: 'ticket-insights-custom-fields-ticket-total-count',
                scope: 'ticket-fields',
                time_dimensions: [
                    {
                        dimension: 'updatedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting when sortDirection and sortBy are provided', () => {
            const actual = ticketFieldsCount.build({
                ...context,
                sortDirection: OrderDirection.Desc,
                sortBy: 'ticketCount',
            })

            const expected = {
                measures: ['ticketCount'],
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
                order: [['ticketCount', 'desc']],
                timezone: 'utc',
                metricName: 'ticket-insights-custom-fields-ticket-total-count',
                scope: 'ticket-fields',
                time_dimensions: [
                    {
                        dimension: 'updatedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting with customFieldValue when sortBy is customFieldValue', () => {
            const actual = ticketFieldsCount.build({
                ...context,
                sortDirection: OrderDirection.Asc,
                sortBy: 'customFieldValue',
            })

            expect(actual.order).toEqual([['customFieldValue', 'asc']])
        })

        it('uses factory function', () => {
            const actual = ticketFieldsCountQueryV2Factory(context)
            const expected = ticketFieldsCount.build(context)

            expect(actual).toEqual(expected)
        })
    })

    describe('ticketFieldsCountPerFieldValue', () => {
        it('creates query with dimensions', () => {
            const actual = ticketFieldsCountPerFieldValue.build(context)

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['customFieldValue'],
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
                metricName: 'ticket-insights-custom-fields-ticket-count',
                scope: 'ticket-fields',
                time_dimensions: [
                    {
                        dimension: 'updatedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting when sortDirection and sortBy are provided', () => {
            const actual = ticketFieldsCountPerFieldValue.build({
                ...context,
                sortDirection: OrderDirection.Asc,
                sortBy: 'customFieldValue',
            })

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['customFieldValue'],
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
                order: [['customFieldValue', 'asc']],
                timezone: 'utc',
                metricName: 'ticket-insights-custom-fields-ticket-count',
                scope: 'ticket-fields',
                time_dimensions: [
                    {
                        dimension: 'updatedDatetime',
                        granularity: 'day',
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting with ticketCount when sortBy is ticketCount', () => {
            const actual = ticketFieldsCountPerFieldValue.build({
                ...context,
                sortDirection: OrderDirection.Desc,
                sortBy: 'ticketCount',
            })

            expect(actual.order).toEqual([['ticketCount', 'desc']])
        })

        it('uses factory function', () => {
            const actual = ticketFieldsCountPerFieldValueQueryV2Factory(context)
            const expected = ticketFieldsCountPerFieldValue.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies custom field filters', () => {
            const contextWithFilters = {
                ...context,
                filters: {
                    ...filters,
                    [APIOnlyFilterKey.CustomFieldId]: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [123],
                    },
                },
            }

            const actual =
                ticketFieldsCountPerFieldValue.build(contextWithFilters)

            expect(actual.filters).toContainEqual({
                member: 'customFieldId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            })
        })
    })

    describe('ticketFieldsCountPerFieldValueTimeSeries', () => {
        it('creates time series query', () => {
            const actual =
                ticketFieldsCountPerFieldValueTimeSeries.build(context)

            const expected = {
                measures: ['ticketCount'],
                dimensions: ['customFieldValue'],
                time_dimensions: [
                    {
                        dimension: 'updatedDatetime',
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
                limit: 10000,
                timezone: 'utc',
                metricName: 'ticket-insights-custom-fields-ticket-count',
                scope: 'ticket-fields',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting when sortDirection is provided', () => {
            const actual = ticketFieldsCountPerFieldValueTimeSeries.build({
                ...context,
                sortDirection: OrderDirection.Desc,
                sortBy: 'ticketCount',
            })

            expect(actual.order).toEqual([['ticketCount', 'desc']])
        })

        it('applies sorting with customFieldValue when sortBy is customFieldValue', () => {
            const actual = ticketFieldsCountPerFieldValueTimeSeries.build({
                ...context,
                sortDirection: OrderDirection.Asc,
                sortBy: 'customFieldValue',
            })

            expect(actual.order).toEqual([['customFieldValue', 'asc']])
        })

        it('uses factory function', () => {
            const actual =
                ticketFieldsCountPerFieldValueTimeSeriesQueryV2Factory(context)
            const expected =
                ticketFieldsCountPerFieldValueTimeSeries.build(context)

            expect(actual).toEqual(expected)
        })

        it('respects granularity from context', () => {
            const weeklyContext = {
                ...context,
                granularity: 'week' as AggregationWindow,
            }

            const actual =
                ticketFieldsCountPerFieldValueTimeSeries.build(weeklyContext)

            expect(actual.time_dimensions).toEqual([
                {
                    dimension: 'updatedDatetime',
                    granularity: 'week',
                },
            ])
        })

        it('applies multiple filters', () => {
            const contextWithFilters = {
                ...context,
                filters: {
                    ...filters,
                    [APIOnlyFilterKey.CustomFieldId]: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [456],
                    },
                    [FilterKey.Channels]: {
                        operator: LogicalOperatorEnum.NOT_ONE_OF,
                        values: ['email', 'chat'],
                    },
                    [FilterKey.AssignedTeam]: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [789],
                    },
                },
            }

            const actual =
                ticketFieldsCountPerFieldValueTimeSeries.build(
                    contextWithFilters,
                )

            expect(actual.filters).toContainEqual({
                member: 'customFieldId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [456],
            })
            expect(actual.filters).toContainEqual({
                member: 'channel',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: ['email', 'chat'],
            })
            expect(actual.filters).toContainEqual({
                member: 'teamId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [789],
            })
        })
    })
})

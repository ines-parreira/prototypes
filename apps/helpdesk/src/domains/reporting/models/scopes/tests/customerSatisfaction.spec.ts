import {
    customerSatisfaction,
    customerSatisfactionPerAgent,
    customerSatisfactionPerAgentQueryV2Factory,
    customerSatisfactionPerChannel,
    customerSatisfactionPerChannelQueryV2Factory,
    customerSatisfactionQueryV2Factory,
} from 'domains/reporting/models/scopes/customerSatisfaction'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

describe('customerSatisfactionScope', () => {
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
        sortDirection: OrderDirection.Asc,
    }

    describe('customerSatisfaction', () => {
        it('creates query', () => {
            const actual = customerSatisfaction.build(context)

            const expected = {
                metricName: 'support-performance-customer-satisfaction',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                order: [['averageSurveyScore', 'asc']],
                timezone: 'utc',
            }

            expect(actual).toEqual(expected)
        })

        it('creates query without sortDirection', () => {
            const actual = customerSatisfaction.build({
                ...context,
                sortDirection: undefined,
            })

            const expected = {
                metricName: 'support-performance-customer-satisfaction',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = customerSatisfaction.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                metricName: 'support-performance-customer-satisfaction',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                order: [['averageSurveyScore', 'desc']],
                timezone: 'utc',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('customerSatisfactionPerAgent', () => {
        it('creates query', () => {
            const actual = customerSatisfactionPerAgent.build(context)

            const expected = {
                metricName:
                    'support-performance-customer-satisfaction-per-agent',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                order: [['averageSurveyScore', 'asc']],
                timezone: 'utc',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('creates query without sortDirection', () => {
            const actual = customerSatisfactionPerAgent.build({
                ...context,
                sortDirection: undefined,
            })

            const expected = {
                metricName:
                    'support-performance-customer-satisfaction-per-agent',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = customerSatisfactionPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                metricName:
                    'support-performance-customer-satisfaction-per-agent',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                order: [['averageSurveyScore', 'desc']],
                timezone: 'utc',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('customerSatisfactionPerChannel', () => {
        it('creates query', () => {
            const actual = customerSatisfactionPerChannel.build(context)

            const expected = {
                metricName:
                    'support-performance-customer-satisfaction-per-channel',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                order: [['averageSurveyScore', 'asc']],
                timezone: 'utc',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('creates query without sortDirection', () => {
            const actual = customerSatisfactionPerChannel.build({
                ...context,
                sortDirection: undefined,
            })

            const expected = {
                metricName:
                    'support-performance-customer-satisfaction-per-channel',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = customerSatisfactionPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                metricName:
                    'support-performance-customer-satisfaction-per-channel',
                scope: 'satisfaction-surveys',
                measures: ['averageSurveyScore'],
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
                order: [['averageSurveyScore', 'desc']],
                timezone: 'utc',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('customerSatisfactionQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    customerSatisfactionQueryV2Factory(context)
                const buildResult = customerSatisfaction.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('customerSatisfactionPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    customerSatisfactionPerAgentQueryV2Factory(context)
                const buildResult = customerSatisfactionPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('customerSatisfactionPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    customerSatisfactionPerChannelQueryV2Factory(context)
                const buildResult =
                    customerSatisfactionPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

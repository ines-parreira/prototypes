import {
    automatedInteractionsPerFlows,
    automatedInteractionsPerFlowsQueryFactoryV2,
    automatedInteractionsPerOrderManagementType,
    automatedInteractionsPerOrderManagementTypeQueryFactoryV2,
    dynamicOverallAutomatedInteractions,
    dynamicOverallAutomatedInteractionsQueryFactoryV2,
    dynamicOverallAutomatedInteractionsTimeseries,
    dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('overallAutomatedInteractionsScope', () => {
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

    describe('dynamicOverallAutomatedInteractions', () => {
        it('creates query without dimensions when no dimension provided', () => {
            const actual = dynamicOverallAutomatedInteractions.build({
                ...context,
                dimensions: [],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-overall-automated-interactions',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            }

            expect(actual).toEqual(expected)
        })

        it('creates query with the provided dimension', () => {
            const actual = dynamicOverallAutomatedInteractions.build({
                ...context,
                dimensions: ['channel'],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-overall-automated-interactions',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('automatedInteractionsPerFlows', () => {
        it('creates query with flowId dimension and Flows feature filter', () => {
            const actual = automatedInteractionsPerFlows.build(context)

            expect(actual).toEqual({
                metricName: 'automated-interactions-per-flows',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['flowId'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['flow'],
                    },
                ],
            })
        })
    })

    describe('automatedInteractionsPerFlowsQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                automatedInteractionsPerFlowsQueryFactoryV2(context)
            const buildResult = automatedInteractionsPerFlows.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('automatedInteractionsPerOrderManagementType', () => {
        it('creates query with orderManagementType dimension and OrderManagement feature filter', () => {
            const actual =
                automatedInteractionsPerOrderManagementType.build(context)

            expect(actual).toEqual({
                metricName: 'automated-interactions-per-order-management-type',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['orderManagementType'],
                timezone: 'utc',
                filters: [
                    ...periodFilters,
                    {
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['order-management'],
                    },
                ],
            })
        })
    })

    describe('automatedInteractionsPerOrderManagementTypeQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                automatedInteractionsPerOrderManagementTypeQueryFactoryV2(
                    context,
                )
            const buildResult =
                automatedInteractionsPerOrderManagementType.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('dynamicOverallAutomatedInteractionsQueryFactoryV2', () => {
            it('returns query with empty dimensions when no dimension provided', () => {
                const factoryResult =
                    dynamicOverallAutomatedInteractionsQueryFactoryV2(context)

                expect(factoryResult.dimensions).toBeUndefined()
            })

            it('returns query with the provided dimension', () => {
                const dimension = 'channel'
                const factoryResult =
                    dynamicOverallAutomatedInteractionsQueryFactoryV2({
                        ...context,
                        dimensions: [dimension],
                    })

                expect(factoryResult.dimensions).toEqual(['channel'])
            })

            it('returns the same result as calling build directly with the dimension', () => {
                const dimension = 'automationFeatureType'
                const factoryResult =
                    dynamicOverallAutomatedInteractionsQueryFactoryV2({
                        ...context,
                        dimensions: [dimension],
                    })
                const buildResult = dynamicOverallAutomatedInteractions.build({
                    ...context,
                    dimensions: [dimension],
                })

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })

    describe('dynamicOverallAutomatedInteractionsTimeseries', () => {
        it('creates query with time_dimensions using granularity from context', () => {
            const actual = dynamicOverallAutomatedInteractionsTimeseries.build({
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [],
            })

            const expected = {
                metricName:
                    'ai-agent-dynamic-overall-automated-interactions-timeseries',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                time_dimensions: [
                    {
                        dimension: 'eventDatetime',
                        granularity: 'day',
                    },
                ],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            }

            expect(actual).toEqual(expected)
        })

        it('creates query with the provided dimensions', () => {
            const actual = dynamicOverallAutomatedInteractionsTimeseries.build({
                ...context,
                granularity: 'week' as AggregationWindow,
                dimensions: ['automationFeatureType'],
            })

            const expected = {
                metricName:
                    'ai-agent-dynamic-overall-automated-interactions-timeseries',
                scope: 'overall-automated-interactions',
                measures: ['automatedInteractionsCount'],
                time_dimensions: [
                    {
                        dimension: 'eventDatetime',
                        granularity: 'week',
                    },
                ],
                dimensions: ['automationFeatureType'],
                timezone: 'utc',
                filters: periodFilters,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: ['automationFeatureType'] as const,
            }

            const factoryResult =
                dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2(ctx)
            const buildResult =
                dynamicOverallAutomatedInteractionsTimeseries.build(ctx)

            expect(factoryResult).toEqual(buildResult)
        })

        it('returns query with time_dimensions when granularity is provided', () => {
            const factoryResult =
                dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2({
                    ...context,
                    granularity: 'month' as AggregationWindow,
                    dimensions: [],
                })

            expect(factoryResult.time_dimensions).toEqual([
                { dimension: 'eventDatetime', granularity: 'month' },
            ])
        })

        it('returns query with the provided dimensions', () => {
            const dimension = 'channel'

            const factoryResult =
                dynamicOverallAutomatedInteractionsTimeseriesQueryFactoryV2({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: [dimension],
                })

            expect(factoryResult.dimensions).toEqual([dimension])
        })
    })
})

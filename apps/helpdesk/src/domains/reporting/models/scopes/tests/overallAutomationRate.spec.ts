import {
    aiAgentAutomationRate,
    aiAgentAutomationRateQueryFactoryV2,
    automationRatePerFeature,
    automationRatePerFeatureQueryFactoryV2,
    dynamicOverallAutomationRate,
    dynamicOverallAutomationRateQueryFactoryV2,
    dynamicOverallAutomationRateTimeseries,
    dynamicOverallAutomationRateTimeseriesQueryFactoryV2,
    overallAutomationRate,
    overallAutomationRatePerOrderManagementType,
    overallAutomationRatePerOrderManagementTypeQueryFactoryV2,
    overallAutomationRateQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('overallAutomationRateScope', () => {
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

    describe('overallAutomationRate', () => {
        it('creates query', () => {
            const actual = overallAutomationRate.build(context)

            const expected = {
                metricName: 'ai-agent-overall-automation-rate',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('aiAgentAutomationRate', () => {
        it('creates query', () => {
            const actual = aiAgentAutomationRate.build(context)

            const expected = {
                metricName: 'ai-agent-automation-rate',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
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
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['ai-agent'],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('automationRatePerFeature', () => {
        it('creates query with automationFeatureType dimension', () => {
            const actual = automationRatePerFeature.build(context)

            const expected = {
                metricName: 'ai-agent-automation-rate-per-feature',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                dimensions: ['automationFeatureType'],
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('dynamicOverallAutomationRate', () => {
        it('creates query without dimensions when no dimension provided', () => {
            const actual = dynamicOverallAutomationRate.build({
                ...context,
                dimensions: [],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-automation-rate',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                dimensions: [],
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
            }

            expect(actual).toEqual(expected)
        })

        it('creates query with the provided dimension', () => {
            const actual = dynamicOverallAutomationRate.build({
                ...context,
                dimensions: ['automationFeatureType'],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-automation-rate',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                dimensions: ['automationFeatureType'],
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('overallAutomationRatePerOrderManagementType', () => {
        it('creates query with orderManagementType dimension and OrderManagement feature filter', () => {
            const actual =
                overallAutomationRatePerOrderManagementType.build(context)

            expect(actual).toEqual({
                metricName:
                    'overall-interaction-rate-per-order-management-type',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                dimensions: ['orderManagementType'],
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
                        member: 'automationFeatureType',
                        operator: 'one-of',
                        values: ['order-management'],
                    },
                ],
            })
        })
    })

    describe('dynamicOverallAutomationRateTimeseries', () => {
        it('creates query with time_dimensions using granularity from context', () => {
            const actual = dynamicOverallAutomationRateTimeseries.build({
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-automation-rate-timeseries',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                time_dimensions: [
                    {
                        dimension: 'eventDatetime',
                        granularity: 'day',
                    },
                ],
                dimensions: [],
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
            }

            expect(actual).toEqual(expected)
        })

        it('creates query with the provided dimensions', () => {
            const actual = dynamicOverallAutomationRateTimeseries.build({
                ...context,
                granularity: 'week' as AggregationWindow,
                dimensions: ['automationFeatureType'],
            })

            const expected = {
                metricName: 'ai-agent-dynamic-automation-rate-timeseries',
                scope: 'overall-automation-rate',
                measures: ['automationRate'],
                time_dimensions: [
                    {
                        dimension: 'eventDatetime',
                        granularity: 'week',
                    },
                ],
                dimensions: ['automationFeatureType'],
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
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('overallAutomationRateQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    overallAutomationRateQueryFactoryV2(context)
                const buildResult = overallAutomationRate.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('aiAgentAutomationRateQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAutomationRateQueryFactoryV2(context)
                const buildResult = aiAgentAutomationRate.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('automationRatePerFeatureQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    automationRatePerFeatureQueryFactoryV2(context)
                const buildResult = automationRatePerFeature.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('overallAutomationRatePerOrderManagementTypeQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    overallAutomationRatePerOrderManagementTypeQueryFactoryV2(
                        context,
                    )
                const buildResult =
                    overallAutomationRatePerOrderManagementType.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('dynamicOverallAutomationRateTimeseriesQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const ctx = {
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['automationFeatureType'] as const,
                }

                const factoryResult =
                    dynamicOverallAutomationRateTimeseriesQueryFactoryV2(ctx)
                const buildResult =
                    dynamicOverallAutomationRateTimeseries.build(ctx)

                expect(factoryResult).toEqual(buildResult)
            })

            it('returns query with time_dimensions when granularity is provided', () => {
                const factoryResult =
                    dynamicOverallAutomationRateTimeseriesQueryFactoryV2({
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
                    dynamicOverallAutomationRateTimeseriesQueryFactoryV2({
                        ...context,
                        granularity: 'day' as AggregationWindow,
                        dimensions: [dimension],
                    })

                expect(factoryResult.dimensions).toEqual([dimension])
            })
        })

        describe('dynamicOverallAutomationRateQueryFactoryV2', () => {
            it('returns query with empty dimensions when no dimension provided', () => {
                const factoryResult =
                    dynamicOverallAutomationRateQueryFactoryV2(context)

                expect(factoryResult.dimensions).toBeUndefined()
            })

            it('returns query with the provided dimension', () => {
                const dimension = 'channel'
                const factoryResult =
                    dynamicOverallAutomationRateQueryFactoryV2({
                        ...context,
                        dimensions: [dimension],
                    })

                expect(factoryResult.dimensions).toEqual(['channel'])
            })

            it('returns the same result as calling build directly with the dimension', () => {
                const dimension = 'aiAgentSkill'
                const factoryResult =
                    dynamicOverallAutomationRateQueryFactoryV2({
                        ...context,
                        dimensions: [dimension],
                    })
                const buildResult = dynamicOverallAutomationRate.build({
                    ...context,
                    dimensions: [dimension],
                })

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

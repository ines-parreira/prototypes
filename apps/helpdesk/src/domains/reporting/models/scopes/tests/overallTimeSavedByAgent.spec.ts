import {
    dynamicAverageTimeSavedByAgent,
    dynamicAverageTimeSavedByAgentQueryFactoryV2,
    dynamicAverageTimeSavedByAgentTimeseries,
    dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2,
    overallTimeSavedByAgentForOrderManagement,
    overallTimeSavedByAgentForOrderManagementQueryFactoryV2,
    overallTimeSavedByAgentPerFlows,
    overallTimeSavedByAgentPerFlowsQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('overallTimeSavedByAgentScope', () => {
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

    describe('overallTimeSavedByAgentForOrderManagement', () => {
        it('creates query with orderManagementType dimension and OrderManagement feature filter', () => {
            const actual =
                overallTimeSavedByAgentForOrderManagement.build(context)

            expect(actual).toEqual({
                metricName:
                    'overall-time-saved-by-agent-per-order-management-type',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
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

    describe('overallTimeSavedByAgentPerFlows', () => {
        it('creates query with flowId dimension and Flows feature filter', () => {
            const actual = overallTimeSavedByAgentPerFlows.build(context)

            expect(actual).toEqual({
                metricName: 'overall-time-saved-by-agent-per-flows',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
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

    describe('overallTimeSavedByAgentPerFlowsQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                overallTimeSavedByAgentPerFlowsQueryFactoryV2(context)
            const buildResult = overallTimeSavedByAgentPerFlows.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('dynamicAverageTimeSavedByAgent', () => {
        it('creates query without dimensions when no dimension provided', () => {
            expect(
                dynamicAverageTimeSavedByAgent.build({
                    ...context,
                    dimensions: [],
                }),
            ).toEqual({
                metricName: 'ai-agent-dynamic-average-time-saved-by-agent',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('creates query with the provided dimension', () => {
            expect(
                dynamicAverageTimeSavedByAgent.build({
                    ...context,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName: 'ai-agent-dynamic-average-time-saved-by-agent',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })
    })

    describe('dynamicAverageTimeSavedByAgentQueryFactoryV2', () => {
        it('returns query with empty dimensions when no dimension provided', () => {
            const result = dynamicAverageTimeSavedByAgentQueryFactoryV2({
                ...context,
                dimensions: [],
            })

            expect(result).toEqual({
                metricName: 'ai-agent-dynamic-average-time-saved-by-agent',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('returns query with the provided dimension', () => {
            const result = dynamicAverageTimeSavedByAgentQueryFactoryV2({
                ...context,
                dimensions: ['channel'],
            })

            expect(result).toEqual({
                metricName: 'ai-agent-dynamic-average-time-saved-by-agent',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('returns the same result as calling build directly with the dimension', () => {
            const ctx = {
                ...context,
                dimensions: ['automationFeatureType'] as const,
            }

            expect(dynamicAverageTimeSavedByAgentQueryFactoryV2(ctx)).toEqual(
                dynamicAverageTimeSavedByAgent.build(ctx),
            )
        })
    })

    describe('dynamicAverageTimeSavedByAgentTimeseries', () => {
        it('creates query with time_dimensions using granularity from context', () => {
            expect(
                dynamicAverageTimeSavedByAgentTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: [],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-average-time-saved-by-agent-timeseries',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('creates query with the provided dimensions', () => {
            expect(
                dynamicAverageTimeSavedByAgentTimeseries.build({
                    ...context,
                    granularity: 'week' as AggregationWindow,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-average-time-saved-by-agent-timeseries',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'week' },
                ],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })
    })

    describe('dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
            }

            expect(
                dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2(ctx),
            ).toEqual(dynamicAverageTimeSavedByAgentTimeseries.build(ctx))
        })

        it('returns query with time_dimensions when granularity is provided', () => {
            const result =
                dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2({
                    ...context,
                    granularity: 'month' as AggregationWindow,
                    dimensions: [],
                })

            expect(result).toEqual({
                metricName:
                    'ai-agent-dynamic-average-time-saved-by-agent-timeseries',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'month' },
                ],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('returns query with the provided dimensions', () => {
            const result =
                dynamicAverageTimeSavedByAgentTimeseriesQueryFactoryV2({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['automationFeatureType'],
                })

            expect(result).toEqual({
                metricName:
                    'ai-agent-dynamic-average-time-saved-by-agent-timeseries',
                scope: 'overall-time-saved-by-agent',
                measures: ['averageTimeSavedByAgent'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                dimensions: ['automationFeatureType'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })
    })

    describe('overallTimeSavedByAgentForOrderManagementQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                overallTimeSavedByAgentForOrderManagementQueryFactoryV2(context)
            const buildResult =
                overallTimeSavedByAgentForOrderManagement.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })
})

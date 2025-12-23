import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    averageCsatScorePerAgentTimeseries,
    averageCsatScorePerAgentTimeseriesQueryV2Factory,
    averageCsatScorePerChannelTimeseries,
    averageCsatScorePerChannelTimeseriesQueryV2Factory,
    averageCsatScorePerIntegrationTimeseries,
    averageCsatScorePerIntegrationTimeseriesQueryV2Factory,
    averageScore,
    averageScoreQueryV2Factory,
} from 'domains/reporting/models/scopes/satisfactionSurveys'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('averageCsatScope', () => {
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

    describe('averageScore', () => {
        it('creates query', () => {
            const actual = averageScore.build(context)

            const expected = {
                measures: ['averageSurveyScore'],
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
                metricName: 'satisfaction-average-score',
                scope: 'satisfaction-surveys',
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
            const actual = averageScore.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['averageSurveyScore'],
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
                order: [['surveyScore', 'desc']],
                metricName: 'satisfaction-average-score',
                scope: 'satisfaction-surveys',
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

    describe('averageCsatScorePerAgentTimeseries', () => {
        it('creates query', () => {
            const actual = averageCsatScorePerAgentTimeseries.build(context)

            const expected = {
                measures: ['averageSurveyScore', 'scoredSurveysCount'],
                dimensions: ['agentId'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                metricName:
                    'satisfaction-average-csat-score-per-agent-time-series',
                scope: 'satisfaction-surveys',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = averageCsatScorePerAgentTimeseries.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['averageSurveyScore', 'scoredSurveysCount'],
                dimensions: ['agentId'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                order: [['scoredSurveysCount', 'asc']],
                metricName:
                    'satisfaction-average-csat-score-per-agent-time-series',
                scope: 'satisfaction-surveys',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('averageCsatScorePerChannelTimeseries', () => {
        it('creates query', () => {
            const actual = averageCsatScorePerChannelTimeseries.build(context)

            const expected = {
                measures: ['averageSurveyScore', 'scoredSurveysCount'],
                dimensions: ['channel'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                metricName:
                    'satisfaction-average-csat-score-per-channel-time-series',
                scope: 'satisfaction-surveys',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = averageCsatScorePerChannelTimeseries.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['averageSurveyScore', 'scoredSurveysCount'],
                dimensions: ['channel'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                order: [['scoredSurveysCount', 'desc']],
                metricName:
                    'satisfaction-average-csat-score-per-channel-time-series',
                scope: 'satisfaction-surveys',
                limit: 10_000,
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('averageCsatScorePerIntegrationTimeseries', () => {
        it('creates query', () => {
            const actual =
                averageCsatScorePerIntegrationTimeseries.build(context)

            const expected = {
                measures: ['averageSurveyScore', 'scoredSurveysCount'],
                dimensions: ['integrationId'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                metricName:
                    'satisfaction-average-csat-score-per-integration-time-series',
                scope: 'satisfaction-surveys',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = averageCsatScorePerIntegrationTimeseries.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['averageSurveyScore', 'scoredSurveysCount'],
                dimensions: ['integrationId'],
                time_dimensions: [
                    {
                        dimension: 'sentDatetime',
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
                ],
                order: [['scoredSurveysCount', 'asc']],
                metricName:
                    'satisfaction-average-csat-score-per-integration-time-series',
                scope: 'satisfaction-surveys',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('averageScoreQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = averageScoreQueryV2Factory(context)
                const buildResult = averageScore.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    averageScoreQueryV2Factory(contextWithSort)
                const buildResult = averageScore.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([['surveyScore', 'desc']])
            })
        })

        describe('averageCsatScorePerAgentTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    averageCsatScorePerAgentTimeseriesQueryV2Factory(context)
                const buildResult =
                    averageCsatScorePerAgentTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    averageCsatScorePerAgentTimeseriesQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    averageCsatScorePerAgentTimeseries.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['scoredSurveysCount', 'asc'],
                ])
            })

            it('handles different granularity levels', () => {
                const weeklyContext = {
                    ...context,
                    granularity: 'week' as AggregationWindow,
                }

                const factoryResult =
                    averageCsatScorePerAgentTimeseriesQueryV2Factory(
                        weeklyContext,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'sentDatetime',
                        granularity: 'week',
                    },
                ])
            })
        })

        describe('averageCsatScorePerChannelTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    averageCsatScorePerChannelTimeseriesQueryV2Factory(context)
                const buildResult =
                    averageCsatScorePerChannelTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Desc,
                }

                const factoryResult =
                    averageCsatScorePerChannelTimeseriesQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    averageCsatScorePerChannelTimeseries.build(contextWithSort)

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['scoredSurveysCount', 'desc'],
                ])
            })

            it('handles different granularity levels', () => {
                const monthlyContext = {
                    ...context,
                    granularity: 'month' as AggregationWindow,
                }

                const factoryResult =
                    averageCsatScorePerChannelTimeseriesQueryV2Factory(
                        monthlyContext,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'sentDatetime',
                        granularity: 'month',
                    },
                ])
            })
        })

        describe('averageCsatScorePerIntegrationTimeseriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    averageCsatScorePerIntegrationTimeseriesQueryV2Factory(
                        context,
                    )
                const buildResult =
                    averageCsatScorePerIntegrationTimeseries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })

            it('handles sorting correctly', () => {
                const contextWithSort = {
                    ...context,
                    sortDirection: OrderDirection.Asc,
                }

                const factoryResult =
                    averageCsatScorePerIntegrationTimeseriesQueryV2Factory(
                        contextWithSort,
                    )
                const buildResult =
                    averageCsatScorePerIntegrationTimeseries.build(
                        contextWithSort,
                    )

                expect(factoryResult).toEqual(buildResult)
                expect(factoryResult.order).toEqual([
                    ['scoredSurveysCount', 'asc'],
                ])
            })

            it('handles different granularity levels', () => {
                const hourlyContext = {
                    ...context,
                    granularity: 'hour' as AggregationWindow,
                }

                const factoryResult =
                    averageCsatScorePerIntegrationTimeseriesQueryV2Factory(
                        hourlyContext,
                    )

                expect(factoryResult.time_dimensions).toEqual([
                    {
                        dimension: 'sentDatetime',
                        granularity: 'hour',
                    },
                ])
            })
        })
    })
})

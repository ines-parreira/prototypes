import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    averageCsatScorePerAgentTimeseries,
    averageCsatScorePerChannelTimeseries,
    averageCsatScorePerIntegrationTimeseries,
    averageScore,
} from 'domains/reporting/models/scopes/averageCsat'
import {
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
                scope: 'average-csat',
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
                scope: 'average-csat',
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
                measures: ['scoredSurveysCount'],
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
                scope: 'average-csat',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = averageCsatScorePerAgentTimeseries.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['scoredSurveysCount'],
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
                scope: 'average-csat',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('averageCsatScorePerChannelTimeseries', () => {
        it('creates query', () => {
            const actual = averageCsatScorePerChannelTimeseries.build(context)

            const expected = {
                measures: ['scoredSurveysCount'],
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
                scope: 'average-csat',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = averageCsatScorePerChannelTimeseries.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            const expected = {
                measures: ['scoredSurveysCount'],
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
                scope: 'average-csat',
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('averageCsatScorePerIntegrationTimeseries', () => {
        it('creates query', () => {
            const actual =
                averageCsatScorePerIntegrationTimeseries.build(context)

            const expected = {
                measures: ['scoredSurveysCount'],
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
                scope: 'average-csat',
            }

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = averageCsatScorePerIntegrationTimeseries.build({
                ...context,
                sortDirection: OrderDirection.Asc,
            })

            const expected = {
                measures: ['scoredSurveysCount'],
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
                scope: 'average-csat',
            }

            expect(actual).toEqual(expected)
        })
    })
})

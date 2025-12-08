import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    humanResponseTimeAfterAiHandoff,
    humanResponseTimeAfterAiHandoffPerAgent,
    humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory,
    humanResponseTimeAfterAiHandoffPerChannel,
    humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory,
    humanResponseTimeAfterAiHandoffQueryV2Factory,
} from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('humanResponseTimeAfterAiHandoffScope', () => {
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

    describe('humanResponseTimeAfterAiHandoff', () => {
        const expected = {
            measures: ['medianFirstResponseTime'],
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
                'support-performance-human-response-time-after-ai-handoff',
            scope: 'human-first-response-time',
            time_dimensions: [
                {
                    dimension: 'firstAgentMessageDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual = humanResponseTimeAfterAiHandoff.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = humanResponseTimeAfterAiHandoff.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianFirstResponseTime', 'desc']],
            })
        })
    })

    describe('humanResponseTimeAfterAiHandoffPerAgent', () => {
        const expected = {
            measures: ['medianFirstResponseTime'],
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
            ],
            metricName:
                'support-performance-human-response-time-after-ai-handoff-per-agent',
            scope: 'human-first-response-time',
            time_dimensions: [
                {
                    dimension: 'firstAgentMessageDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual =
                humanResponseTimeAfterAiHandoffPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = humanResponseTimeAfterAiHandoffPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianFirstResponseTime', 'desc']],
            })
        })
    })

    describe('humanResponseTimeAfterAiHandoffPerChannel', () => {
        const expected = {
            measures: ['medianFirstResponseTime'],
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
            ],
            metricName:
                'support-performance-human-response-time-after-ai-handoff-per-channel',
            scope: 'human-first-response-time',
            time_dimensions: [
                {
                    dimension: 'firstAgentMessageDatetime',
                    granularity: 'day',
                },
            ],
        }

        it('creates query', () => {
            const actual =
                humanResponseTimeAfterAiHandoffPerChannel.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = humanResponseTimeAfterAiHandoffPerChannel.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['medianFirstResponseTime', 'desc']],
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('medianFirstResponseTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    humanResponseTimeAfterAiHandoffQueryV2Factory(context)
                const buildResult =
                    humanResponseTimeAfterAiHandoff.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory(
                        context,
                    )
                const buildResult =
                    humanResponseTimeAfterAiHandoffPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    humanResponseTimeAfterAiHandoffPerChannelQueryV2Factory(
                        context,
                    )
                const buildResult =
                    humanResponseTimeAfterAiHandoffPerChannel.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

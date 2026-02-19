import {
    aiAgentAutomatedInteractions,
    aiAgentAutomatedInteractionsQueryV2Factory,
    aiAgentAutomatedInteractionsTimeSeries,
    aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory,
    automatedInteractions,
    automatedInteractionsQueryV2Factory,
} from 'domains/reporting/models/scopes/automatedInteractions'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('automationRateScope', () => {
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

    describe('automatedInteractions', () => {
        it('creates query', () => {
            const actual = automatedInteractions.build(context)

            const expected = {
                metricName: 'automate-automation-dataset',
                scope: 'automated-interactions',
                measures: [
                    'automatedInteractions',
                    'automatedInteractionsByAutoResponders',
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

    describe('aiAgentAutomatedInteractions', () => {
        it('creates query', () => {
            const actual = aiAgentAutomatedInteractions.build(context)

            const expected = {
                metricName: 'ai-agent-automated-interactions',
                scope: 'automated-interactions',
                measures: [
                    'automatedInteractions',
                    'automatedInteractionsByAutoResponders',
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
                    {
                        member: 'eventType',
                        operator: 'one-of',
                        values: ['ai_agent_ticket_resolved'],
                    },
                ],
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

    describe('aiAgentAutomatedInteractionsTimeSeries', () => {
        it('creates query', () => {
            const actual = aiAgentAutomatedInteractionsTimeSeries.build(context)

            const expected = {
                metricName: 'ai-agent-automated-interactions-time-series',
                scope: 'automated-interactions',
                measures: [
                    'automatedInteractions',
                    'automatedInteractionsByAutoResponders',
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
                    {
                        member: 'eventType',
                        operator: 'one-of',
                        values: ['ai_agent_ticket_resolved'],
                    },
                ],
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

    describe('QueryV2Factory methods', () => {
        describe('automatedInteractionsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    automatedInteractionsQueryV2Factory(context)
                const buildResult = automatedInteractions.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('aiAgentAutomatedInteractionsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAutomatedInteractionsQueryV2Factory(context)
                const buildResult = aiAgentAutomatedInteractions.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory(
                        context,
                    )
                const buildResult =
                    aiAgentAutomatedInteractionsTimeSeries.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

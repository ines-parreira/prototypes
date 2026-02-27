import {
    aiAgentAutomatedInteractions,
    aiAgentAutomatedInteractionsQueryV2Factory,
    aiAgentAutomatedInteractionsTimeSeries,
    aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory,
    aiAgentHandovers,
    aiAgentHandoversQueryV2Factory,
    articleRecommendationAutomatedInteractions,
    articleRecommendationAutomatedInteractionsQueryV2Factory,
    automatedInteractions,
    automatedInteractionsQueryV2Factory,
    flowsAutomatedInteractions,
    flowsAutomatedInteractionsQueryV2Factory,
    flowsHandovers,
    flowsHandoversQueryV2Factory,
    orderManagementAutomatedInteractions,
    orderManagementAutomatedInteractionsQueryV2Factory,
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

    describe('flowsAutomatedInteractions', () => {
        it('creates query', () => {
            const actual = flowsAutomatedInteractions.build(context)

            const expected = {
                metricName: 'automate-flows-automated-interactions',
                scope: 'automated-interactions',
                measures: ['automatedInteractions'],
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
                        values: [
                            'flow_started',
                            'flow_prompt_started',
                            'flow_ended_without_action',
                        ],
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

    describe('articleRecommendationAutomatedInteractions', () => {
        it('creates query', () => {
            const actual =
                articleRecommendationAutomatedInteractions.build(context)

            const expected = {
                metricName:
                    'automate-article-recommendation-automated-interactions',
                scope: 'automated-interactions',
                measures: ['automatedInteractions'],
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
                        values: ['article_recommendation_started'],
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

    describe('orderManagementAutomatedInteractions', () => {
        it('creates query', () => {
            const actual = orderManagementAutomatedInteractions.build(context)

            const expected = {
                metricName: 'automate-order-management-automated-interactions',
                scope: 'automated-interactions',
                measures: ['automatedInteractions'],
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
                        values: [
                            'track_order',
                            'loop_returns_started',
                            'automated_response_started',
                        ],
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

    describe('aiAgentHandovers', () => {
        it('creates query', () => {
            const actual = aiAgentHandovers.build(context)

            const expected = {
                metricName: 'automate-ai-agent-handovers',
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
                        values: ['ai_agent_ticket_handover'],
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

    describe('flowsHandovers', () => {
        it('creates query', () => {
            const actual = flowsHandovers.build(context)

            const expected = {
                metricName: 'automate-flows-handovers',
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
                        values: ['flow_handover_ticket_created'],
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

        describe('flowsAutomatedInteractionsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    flowsAutomatedInteractionsQueryV2Factory(context)
                const buildResult = flowsAutomatedInteractions.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('articleRecommendationAutomatedInteractionsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    articleRecommendationAutomatedInteractionsQueryV2Factory(
                        context,
                    )
                const buildResult =
                    articleRecommendationAutomatedInteractions.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('orderManagementAutomatedInteractionsQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    orderManagementAutomatedInteractionsQueryV2Factory(context)
                const buildResult =
                    orderManagementAutomatedInteractions.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('aiAgentHandoversQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = aiAgentHandoversQueryV2Factory(context)
                const buildResult = aiAgentHandovers.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('flowsHandoversQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = flowsHandoversQueryV2Factory(context)
                const buildResult = flowsHandovers.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})

import {
    aiAgentAutomatedInteractionsPerChannel,
    aiAgentAutomatedInteractionsPerChannelQueryFactoryV2,
    aiAgentAutomatedInteractionsPerIntent,
    aiAgentAutomatedInteractionsPerIntentQueryFactoryV2,
    aiAgentAutomatedInteractionsScope,
    aiSalesAgentAutomatedInteractionsPerChannel,
    aiSalesAgentAutomatedInteractionsPerChannelQueryFactoryV2,
    aiSalesAgentAutomatedInteractionsPerEngagementType,
    aiSalesAgentAutomatedInteractionsPerEngagementTypeQueryFactoryV2,
    aiSupportAgentAutomatedInteractionsPerChannel,
    aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2,
    aiSupportAgentAutomatedInteractionsPerIntent,
    aiSupportAgentAutomatedInteractionsPerIntentQueryFactoryV2,
    dynamicAiShoppingAgentAutomatedInteractionsTimeseries,
    dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
    dynamicAllAgentsAutomatedInteractions,
    dynamicAllAgentsAutomatedInteractionsQueryFactoryV2,
    dynamicAllAgentsAutomatedInteractionsTimeseries,
    dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
    dynamicShoppingAssistantAutomatedInteractions,
    dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentAutomatedInteractionsScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
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

    const context = {
        filters: baseFilters,
        timezone: 'utc',
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'periodStart',
                operator: 'afterDate',
            }),
        )
        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'periodEnd',
                operator: 'beforeDate',
            }),
        )
    })

    it('includes aiAgentRole filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            aiAgentRole: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['support'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
            }),
        )
    })

    it('omits aiAgentRole filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'aiAgentRole' }),
        )
    })

    it('includes channel filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            channels: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
        )
    })

    it('includes engagementType filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            engagementType: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['proactive'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'engagementType',
                operator: 'one-of',
            }),
        )
    })

    it('omits engagementType filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'engagementType' }),
        )
    })

    it('includes storeIntegrationId filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            storeIntegrations: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [1],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'integrationId',
                operator: 'one-of',
            }),
        )
    })

    it('omits storeIntegrationId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })

    const salesSkillFilter = {
        member: 'aiAgentRole',
        operator: 'one-of',
        values: ['ai-agent-sales'],
    }

    describe('dynamicAiSalesAgentAutomatedInteractions', () => {
        it('creates query without dimensions when no dimension provided', () => {
            expect(
                dynamicShoppingAssistantAutomatedInteractions.build({
                    ...context,
                    dimensions: [],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-shopping-assistant-automated-interactions',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: [],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })

        it('creates query with the provided dimension', () => {
            expect(
                dynamicShoppingAssistantAutomatedInteractions.build({
                    ...context,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-shopping-assistant-automated-interactions',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })
    })

    describe('dynamicAiSalesAgentAutomatedInteractionsQueryFactoryV2', () => {
        it('returns query with empty dimensions when no dimension provided', () => {
            const result =
                dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2({
                    ...context,
                    dimensions: [],
                })

            expect(result).toEqual({
                metricName:
                    'ai-agent-dynamic-shopping-assistant-automated-interactions',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: [],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })

        it('returns query with the provided dimension', () => {
            const result =
                dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2({
                    ...context,
                    dimensions: ['channel'],
                })

            expect(result).toEqual({
                metricName:
                    'ai-agent-dynamic-shopping-assistant-automated-interactions',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })

        it('returns the same result as calling build directly with the dimension', () => {
            const ctx = { ...context, dimensions: ['engagementType'] as const }

            expect(
                dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2(
                    ctx,
                ),
            ).toEqual(dynamicShoppingAssistantAutomatedInteractions.build(ctx))
        })
    })

    describe('dynamicAiShoppingAgentAutomatedInteractionsTimeseries', () => {
        it('creates query with time_dimensions using granularity from context', () => {
            expect(
                dynamicAiShoppingAgentAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: [],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-shopping-assistant-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                dimensions: [],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })

        it('creates query with the provided dimensions', () => {
            expect(
                dynamicAiShoppingAgentAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-shopping-assistant-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })
    })

    describe('dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [] as const,
            }

            expect(
                dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2(
                    ctx,
                ),
            ).toEqual(
                dynamicAiShoppingAgentAutomatedInteractionsTimeseries.build(
                    ctx,
                ),
            )
        })

        it('returns query with time_dimensions when granularity is provided', () => {
            const result =
                dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2(
                    {
                        ...context,
                        granularity: 'week' as AggregationWindow,
                        dimensions: [],
                    },
                )

            expect(result.time_dimensions).toEqual([
                { dimension: 'eventDatetime', granularity: 'week' },
            ])
        })

        it('returns query with the provided dimensions', () => {
            const result =
                dynamicAiShoppingAgentAutomatedInteractionsTimeseriesQueryFactoryV2(
                    {
                        ...context,
                        granularity: 'day' as AggregationWindow,
                        dimensions: ['engagementType'],
                    },
                )

            expect(result.dimensions).toEqual(['engagementType'])
        })
    })

    describe('aiAgentAutomatedInteractionsPerChannel', () => {
        const filters: StatsFilters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        }
        const timezone = 'utc'
        const context = { filters, timezone }

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

        it('builds query with correct metricName, scope, measures, dimensions, and filters', () => {
            const actual = aiAgentAutomatedInteractionsPerChannel.build(context)

            expect(actual).toEqual({
                metricName: 'ai-agent-automated-interactions-per-channel',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        describe('aiAgentAutomatedInteractionsPerChannelQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    aiAgentAutomatedInteractionsPerChannelQueryFactoryV2(
                        context,
                    ),
                ).toEqual(aiAgentAutomatedInteractionsPerChannel.build(context))
            })
        })
    })

    describe('aiAgentAutomatedInteractionsPerIntent', () => {
        const filters: StatsFilters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        }
        const timezone = 'utc'
        const context = { filters, timezone }

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

        it('builds query with correct metricName, scope, measures, dimensions, and filters', () => {
            const actual = aiAgentAutomatedInteractionsPerIntent.build(context)

            expect(actual).toEqual({
                metricName: 'ai-agent-automated-interactions-per-intent',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['aiIntentCustomField'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        describe('aiAgentAutomatedInteractionsPerIntentQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    aiAgentAutomatedInteractionsPerIntentQueryFactoryV2(
                        context,
                    ),
                ).toEqual(aiAgentAutomatedInteractionsPerIntent.build(context))
            })
        })
    })

    describe('aiSalesAgentAutomatedInteractionsPerEngagementType', () => {
        const filters: StatsFilters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        }
        const timezone = 'utc'
        const context = { filters, timezone }

        it('builds query with engagementType dimension and sales agent filter', () => {
            const actual =
                aiSalesAgentAutomatedInteractionsPerEngagementType.build(
                    context,
                )

            expect(actual).toEqual({
                metricName:
                    'ai-agent-sales-performance-automated-interactions-per-engagement-type',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['engagementType'],
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
                        member: 'aiAgentRole',
                        operator: 'one-of',
                        values: ['ai-agent-sales'],
                    },
                ],
            })
        })

        it('returns the same result as build directly', () => {
            expect(
                aiSalesAgentAutomatedInteractionsPerEngagementTypeQueryFactoryV2(
                    context,
                ),
            ).toEqual(
                aiSalesAgentAutomatedInteractionsPerEngagementType.build(
                    context,
                ),
            )
        })
    })

    describe('aiSalesAgentAutomatedInteractionsPerChannel', () => {
        const filters: StatsFilters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        }
        const timezone = 'utc'
        const context = { filters, timezone }

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

        const salesSkillFilter = {
            member: 'aiAgentRole',
            operator: 'one-of',
            values: ['ai-agent-sales'],
        }

        it('builds query with channel dimension and AiAgentSales skill filter', () => {
            const actual =
                aiSalesAgentAutomatedInteractionsPerChannel.build(context)

            expect(actual).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-automated-interactions-per-channel',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })

        describe('aiSalesAgentAutomatedInteractionsPerChannelQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    aiSalesAgentAutomatedInteractionsPerChannelQueryFactoryV2(
                        context,
                    ),
                ).toEqual(
                    aiSalesAgentAutomatedInteractionsPerChannel.build(context),
                )
            })
        })
    })
})

describe('aiSupportAgentAutomatedInteractionsPerChannel', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

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

    it('builds query with correct metricName, measures, channel dimension, and aiAgentRole filter', () => {
        const actual =
            aiSupportAgentAutomatedInteractionsPerChannel.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-support-automated-interactions-per-channel',
            scope: 'ai-agent-automated-interactions',
            measures: ['automatedInteractionsCount'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: [
                ...periodFilters,
                {
                    member: 'aiAgentRole',
                    operator: 'one-of',
                    values: ['ai-agent-support'],
                },
            ],
        })
    })

    describe('aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiSupportAgentAutomatedInteractionsPerChannelQueryFactoryV2(
                    context,
                ),
            ).toEqual(
                aiSupportAgentAutomatedInteractionsPerChannel.build(context),
            )
        })
    })

    describe('dynamicAllAgentsAutomatedInteractions', () => {
        const baseFilters: ApiStatsFilters = {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
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

        const context = {
            filters: baseFilters,
            timezone: 'utc',
        }

        describe('dynamicAllAgentsAutomatedInteractions', () => {
            it('creates query without dimensions when no dimension provided', () => {
                expect(
                    dynamicAllAgentsAutomatedInteractions.build({
                        ...context,
                        dimensions: [],
                    }),
                ).toEqual({
                    metricName:
                        'ai-agent-dynamic-all-agents-automated-interactions',
                    scope: 'ai-agent-automated-interactions',
                    measures: ['automatedInteractionsCount'],
                    dimensions: [],
                    timezone: 'utc',
                    filters: periodFilters,
                })
            })

            it('creates query with the provided dimension', () => {
                expect(
                    dynamicAllAgentsAutomatedInteractions.build({
                        ...context,
                        dimensions: ['channel'],
                    }),
                ).toEqual({
                    metricName:
                        'ai-agent-dynamic-all-agents-automated-interactions',
                    scope: 'ai-agent-automated-interactions',
                    measures: ['automatedInteractionsCount'],
                    dimensions: ['channel'],
                    timezone: 'utc',
                    filters: periodFilters,
                })
            })
        })

        describe('dynamicAllAgentsAutomatedInteractionsQueryFactoryV2', () => {
            it('returns query with empty dimensions when no dimension provided', () => {
                const result =
                    dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                        ...context,
                        dimensions: [],
                    })

                expect(result).toEqual({
                    metricName:
                        'ai-agent-dynamic-all-agents-automated-interactions',
                    scope: 'ai-agent-automated-interactions',
                    measures: ['automatedInteractionsCount'],
                    dimensions: [],
                    timezone: 'utc',
                    filters: periodFilters,
                })
            })

            it('returns query with the provided dimension', () => {
                const result =
                    dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                        ...context,
                        dimensions: ['channel'],
                    })

                expect(result).toEqual({
                    metricName:
                        'ai-agent-dynamic-all-agents-automated-interactions',
                    scope: 'ai-agent-automated-interactions',
                    measures: ['automatedInteractionsCount'],
                    dimensions: ['channel'],
                    timezone: 'utc',
                    filters: periodFilters,
                })
            })

            it('returns the same result as calling build directly with the dimension', () => {
                const ctx = {
                    ...context,
                    dimensions: ['storeIntegrationId'] as const,
                }

                expect(
                    dynamicAllAgentsAutomatedInteractionsQueryFactoryV2(ctx),
                ).toEqual(dynamicAllAgentsAutomatedInteractions.build(ctx))
            })
        })
    })

    describe('dynamicAllAgentsAutomatedInteractionsTimeseries', () => {
        it('creates query with time_dimensions using granularity from context', () => {
            expect(
                dynamicAllAgentsAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: [],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-all-agents-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
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
                dynamicAllAgentsAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'week' as AggregationWindow,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-all-agents-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'week' },
                ],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        describe('dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const ctx = {
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['channel'] as const,
                }

                expect(
                    dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2(
                        ctx,
                    ),
                ).toEqual(
                    dynamicAllAgentsAutomatedInteractionsTimeseries.build(ctx),
                )
            })

            it('returns query with time_dimensions when granularity is provided', () => {
                const result =
                    dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2(
                        {
                            ...context,
                            granularity: 'month' as AggregationWindow,
                            dimensions: [],
                        },
                    )

                expect(result.time_dimensions).toEqual([
                    { dimension: 'eventDatetime', granularity: 'month' },
                ])
            })

            it('returns query with the provided dimensions', () => {
                const result =
                    dynamicAllAgentsAutomatedInteractionsTimeseriesQueryFactoryV2(
                        {
                            ...context,
                            granularity: 'day' as AggregationWindow,
                            dimensions: ['storeIntegrationId'],
                        },
                    )

                expect(result.dimensions).toEqual(['storeIntegrationId'])
            })
        })
    })
})

describe('aiSupportAgentAutomatedInteractionsPerIntent', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

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

    it('builds query with correct metricName, measures, aiIntentCustomField dimension, and aiAgentRole filter', () => {
        const actual =
            aiSupportAgentAutomatedInteractionsPerIntent.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-support-automated-interactions-per-intent',
            scope: 'ai-agent-automated-interactions',
            measures: ['automatedInteractionsCount'],
            dimensions: ['aiIntentCustomField'],
            timezone: 'utc',
            filters: [
                ...periodFilters,
                {
                    member: 'aiAgentRole',
                    operator: 'one-of',
                    values: ['ai-agent-support'],
                },
            ],
        })
    })

    describe('aiSupportAgentAutomatedInteractionsPerIntentQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiSupportAgentAutomatedInteractionsPerIntentQueryFactoryV2(
                    context,
                ),
            ).toEqual(
                aiSupportAgentAutomatedInteractionsPerIntent.build(context),
            )
        })
    })
})

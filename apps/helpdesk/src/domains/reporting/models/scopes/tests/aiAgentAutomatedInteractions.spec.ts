import {
    aiAgentAutomatedInteractionsScope,
    allAgentsAutomatedInteractionsBreakdown,
    allAgentsAutomatedInteractionsBreakdownQueryFactoryV2,
    allAgentsAutomatedInteractionsTimeseries,
    allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
    allAgentsAutomatedInteractionsValue,
    allAgentsAutomatedInteractionsValueQueryFactoryV2,
    shoppingAssistantAutomatedInteractionsBreakdown,
    shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2,
    shoppingAssistantAutomatedInteractionsTimeseries,
    shoppingAssistantAutomatedInteractionsTimeseriesQueryFactoryV2,
    shoppingAssistantAutomatedInteractionsValue,
    shoppingAssistantAutomatedInteractionsValueQueryFactoryV2,
    supportAgentAutomatedInteractionsBreakdown,
    supportAgentAutomatedInteractionsBreakdownQueryFactoryV2,
    supportAgentAutomatedInteractionsTimeseries,
    supportAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
    supportAgentAutomatedInteractionsValue,
    supportAgentAutomatedInteractionsValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
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

    const salesSkillFilter = {
        member: 'aiAgentRole',
        operator: 'one-of',
        values: ['ai-agent-sales'],
    }

    const supportSkillFilter = {
        member: 'aiAgentRole',
        operator: 'one-of',
        values: ['ai-agent-support'],
    }

    const context = {
        filters: baseFilters,
        timezone: 'utc',
    }

    describe('createScopeFilters', () => {
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

        it.each([
            [
                'aiAgentRole',
                {
                    aiAgentRole: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['support'],
                    },
                },
            ],
            [
                'channel',
                {
                    channels: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['email'],
                    },
                },
            ],
            [
                'engagementType',
                {
                    engagementType: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['proactive'],
                    },
                },
            ],
            [
                'storeIntegrationId',
                {
                    storeIntegrations: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1],
                    },
                },
            ],
        ])('includes %s filter when provided', (member, extra) => {
            const result = createScopeFilters(
                { ...baseFilters, ...extra } as ApiStatsFilters,
                aiAgentAutomatedInteractionsScope.config,
            )

            expect(result).toContainEqual(
                expect.objectContaining({ member, operator: 'one-of' }),
            )
        })
    })

    describe('allAgents triplet', () => {
        it('value returns measures + period filters only', () => {
            expect(allAgentsAutomatedInteractionsValue.build(context)).toEqual({
                metricName: 'ai-agent-automated-interactions-value',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('breakdown forwards ctx.dimensions and uses the default metric name for unmapped dims', () => {
            expect(
                allAgentsAutomatedInteractionsBreakdown.build({
                    ...context,
                    dimensions: ['engagementType'],
                }),
            ).toEqual({
                metricName: 'ai-agent-automated-interactions-breakdown',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['engagementType'],
                timezone: 'utc',
                filters: periodFilters,
                limit: 10000,
            })
        })

        it.each([
            [
                'channel',
                'ai-agent-automated-interactions-breakdown-per-channel',
            ],
            [
                'storeIntegrationId',
                'ai-agent-automated-interactions-breakdown-per-store',
            ],
            [
                'aiIntentCustomField',
                'ai-agent-automated-interactions-breakdown-per-intent',
            ],
        ] as const)(
            'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
            (dimension, expectedMetricName) => {
                expect(
                    allAgentsAutomatedInteractionsBreakdown.build({
                        ...context,
                        dimensions: [dimension],
                    }).metricName,
                ).toBe(expectedMetricName)
            },
        )

        it('breakdown falls back to the default metric name for multi-dim breakdowns', () => {
            expect(
                allAgentsAutomatedInteractionsBreakdown.build({
                    ...context,
                    dimensions: ['channel', 'storeIntegrationId'],
                }).metricName,
            ).toBe('ai-agent-automated-interactions-breakdown')
        })

        it('timeseries adds time_dimensions and limit and uses the default metric name for unmapped dims', () => {
            expect(
                allAgentsAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['engagementType'],
                }),
            ).toEqual({
                metricName: 'ai-agent-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['engagementType'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                timezone: 'utc',
                filters: periodFilters,
                limit: 10000,
            })
        })

        it.each([
            [
                'channel',
                'ai-agent-automated-interactions-timeseries-per-channel',
            ],
            [
                'storeIntegrationId',
                'ai-agent-automated-interactions-timeseries-per-store',
            ],
            [
                'aiIntentCustomField',
                'ai-agent-automated-interactions-timeseries-per-intent',
            ],
        ] as const)(
            'timeseries uses the per-dimension metric name when ctx.dimensions=[%s]',
            (dimension, expectedMetricName) => {
                expect(
                    allAgentsAutomatedInteractionsTimeseries.build({
                        ...context,
                        granularity: 'day' as AggregationWindow,
                        dimensions: [dimension],
                    }).metricName,
                ).toBe(expectedMetricName)
            },
        )

        it('QueryFactoryV2 wrappers match build output', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: ['channel'] as const,
            }
            expect(
                allAgentsAutomatedInteractionsValueQueryFactoryV2(ctx),
            ).toEqual(allAgentsAutomatedInteractionsValue.build(ctx))
            expect(
                allAgentsAutomatedInteractionsBreakdownQueryFactoryV2(ctx),
            ).toEqual(allAgentsAutomatedInteractionsBreakdown.build(ctx))
            expect(
                allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2(ctx),
            ).toEqual(allAgentsAutomatedInteractionsTimeseries.build(ctx))
        })
    })

    describe('shoppingAssistant triplet', () => {
        it('value scopes to the Sales role', () => {
            expect(
                shoppingAssistantAutomatedInteractionsValue.build(context),
            ).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-automated-interactions-value',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
            })
        })

        it('breakdown forwards ctx.dimensions with Sales filter and uses the default metric name for unmapped dims', () => {
            expect(
                shoppingAssistantAutomatedInteractionsBreakdown.build({
                    ...context,
                    dimensions: ['aiIntentCustomField'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-automated-interactions-breakdown',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['aiIntentCustomField'],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
                limit: 10000,
            })
        })

        it.each([
            [
                'channel',
                'ai-agent-shopping-assistant-automated-interactions-breakdown-per-channel',
            ],
            [
                'storeIntegrationId',
                'ai-agent-shopping-assistant-automated-interactions-breakdown-per-store',
            ],
            [
                'engagementType',
                'ai-agent-shopping-assistant-automated-interactions-breakdown-per-engagement-type',
            ],
        ] as const)(
            'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
            (dimension, expectedMetricName) => {
                expect(
                    shoppingAssistantAutomatedInteractionsBreakdown.build({
                        ...context,
                        dimensions: [dimension],
                    }).metricName,
                ).toBe(expectedMetricName)
            },
        )

        it('timeseries adds time_dimensions with Sales filter and uses the default metric name for unmapped dims', () => {
            expect(
                shoppingAssistantAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'week' as AggregationWindow,
                    dimensions: [],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-shopping-assistant-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: [],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'week' },
                ],
                timezone: 'utc',
                filters: [...periodFilters, salesSkillFilter],
                limit: 10000,
            })
        })

        it.each([
            [
                'channel',
                'ai-agent-shopping-assistant-automated-interactions-timeseries-per-channel',
            ],
            [
                'storeIntegrationId',
                'ai-agent-shopping-assistant-automated-interactions-timeseries-per-store',
            ],
            [
                'engagementType',
                'ai-agent-shopping-assistant-automated-interactions-timeseries-per-engagement-type',
            ],
        ] as const)(
            'timeseries uses the per-dimension metric name when ctx.dimensions=[%s]',
            (dimension, expectedMetricName) => {
                expect(
                    shoppingAssistantAutomatedInteractionsTimeseries.build({
                        ...context,
                        granularity: 'day' as AggregationWindow,
                        dimensions: [dimension],
                    }).metricName,
                ).toBe(expectedMetricName)
            },
        )

        it('QueryFactoryV2 wrappers match build output', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: ['channel'] as const,
            }
            expect(
                shoppingAssistantAutomatedInteractionsValueQueryFactoryV2(ctx),
            ).toEqual(shoppingAssistantAutomatedInteractionsValue.build(ctx))
            expect(
                shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2(
                    ctx,
                ),
            ).toEqual(
                shoppingAssistantAutomatedInteractionsBreakdown.build(ctx),
            )
            expect(
                shoppingAssistantAutomatedInteractionsTimeseriesQueryFactoryV2(
                    ctx,
                ),
            ).toEqual(
                shoppingAssistantAutomatedInteractionsTimeseries.build(ctx),
            )
        })
    })

    describe('supportAgent triplet', () => {
        it('value scopes to the Support role', () => {
            expect(
                supportAgentAutomatedInteractionsValue.build(context),
            ).toEqual({
                metricName:
                    'ai-agent-support-agent-automated-interactions-value',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
            })
        })

        it('breakdown forwards ctx.dimensions with Support filter and uses the default metric name for unmapped dims', () => {
            expect(
                supportAgentAutomatedInteractionsBreakdown.build({
                    ...context,
                    dimensions: ['engagementType'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-support-agent-automated-interactions-breakdown',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['engagementType'],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
                limit: 10000,
            })
        })

        it.each([
            [
                'channel',
                'ai-agent-support-agent-automated-interactions-breakdown-per-channel',
            ],
            [
                'storeIntegrationId',
                'ai-agent-support-agent-automated-interactions-breakdown-per-store',
            ],
            [
                'aiIntentCustomField',
                'ai-agent-support-agent-automated-interactions-breakdown-per-intent',
            ],
        ] as const)(
            'breakdown uses the per-dimension metric name when ctx.dimensions=[%s]',
            (dimension, expectedMetricName) => {
                expect(
                    supportAgentAutomatedInteractionsBreakdown.build({
                        ...context,
                        dimensions: [dimension],
                    }).metricName,
                ).toBe(expectedMetricName)
            },
        )

        it('timeseries adds time_dimensions with Support filter and uses the default metric name for unmapped dims', () => {
            expect(
                supportAgentAutomatedInteractionsTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['engagementType'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-support-agent-automated-interactions-timeseries',
                scope: 'ai-agent-automated-interactions',
                measures: ['automatedInteractionsCount'],
                dimensions: ['engagementType'],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
                limit: 10000,
            })
        })

        it.each([
            [
                'channel',
                'ai-agent-support-agent-automated-interactions-timeseries-per-channel',
            ],
            [
                'storeIntegrationId',
                'ai-agent-support-agent-automated-interactions-timeseries-per-store',
            ],
            [
                'aiIntentCustomField',
                'ai-agent-support-agent-automated-interactions-timeseries-per-intent',
            ],
        ] as const)(
            'timeseries uses the per-dimension metric name when ctx.dimensions=[%s]',
            (dimension, expectedMetricName) => {
                expect(
                    supportAgentAutomatedInteractionsTimeseries.build({
                        ...context,
                        granularity: 'day' as AggregationWindow,
                        dimensions: [dimension],
                    }).metricName,
                ).toBe(expectedMetricName)
            },
        )

        it('QueryFactoryV2 wrappers match build output', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: ['channel'] as const,
            }
            expect(
                supportAgentAutomatedInteractionsValueQueryFactoryV2(ctx),
            ).toEqual(supportAgentAutomatedInteractionsValue.build(ctx))
            expect(
                supportAgentAutomatedInteractionsBreakdownQueryFactoryV2(ctx),
            ).toEqual(supportAgentAutomatedInteractionsBreakdown.build(ctx))
            expect(
                supportAgentAutomatedInteractionsTimeseriesQueryFactoryV2(ctx),
            ).toEqual(supportAgentAutomatedInteractionsTimeseries.build(ctx))
        })
    })
})

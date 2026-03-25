import {
    aiAgentAutomatedInteractionsPerChannel,
    aiAgentAutomatedInteractionsPerChannelQueryFactoryV2,
    aiAgentAutomatedInteractionsPerIntent,
    aiAgentAutomatedInteractionsPerIntentQueryFactoryV2,
    aiAgentAutomatedInteractionsScope,
    dynamicShoppingAssistantAutomatedInteractions,
    dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
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

    it('includes aiAgentSkill filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            aiAgentSkill: {
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
                member: 'aiAgentSkill',
                operator: 'one-of',
            }),
        )
    })

    it('omits aiAgentSkill filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentAutomatedInteractionsScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'aiAgentSkill' }),
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
        member: 'aiAgentSkill',
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
                aiAgentAutomatedInteractionsPerChannelQueryFactoryV2(context),
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
                aiAgentAutomatedInteractionsPerIntentQueryFactoryV2(context),
            ).toEqual(aiAgentAutomatedInteractionsPerIntent.build(context))
        })
    })
})

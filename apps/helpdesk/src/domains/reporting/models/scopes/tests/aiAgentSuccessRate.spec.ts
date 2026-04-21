import {
    aiAgentAllAgentsSuccessRateTrend,
    aiAgentAllAgentsSuccessRateTrendQueryFactory,
    aiAgentShoppingAssistantSuccessRateTrend,
    aiAgentShoppingAssistantSuccessRateTrendQueryFactory,
    aiAgentSuccessRatePerChannel,
    aiAgentSuccessRatePerChannelQueryFactoryV2,
    aiAgentSuccessRatePerIntent,
    aiAgentSuccessRatePerIntentQueryFactoryV2,
    aiAgentSuccessRateScope,
    aiSupportAgentSuccessRatePerIntent,
    aiSupportAgentSuccessRatePerIntentQueryFactoryV2,
    aiSupportAgentSuccessRateTrend,
    aiSupportAgentSuccessRateTrendQueryFactory,
} from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentSuccessRateScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('aiAgentAllAgentsSuccessRateTrend', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    it('builds query with correct metricName, scope, and measures', () => {
        const actual = aiAgentAllAgentsSuccessRateTrend.build(context)

        expect(actual).toMatchObject({
            metricName: 'ai-agent-all-agents-success-rate',
            scope: 'ai-agent-success-rate',
            measures: ['successRate'],
            timezone: 'utc',
        })
    })

    describe('aiAgentAllAgentsSuccessRateTrendQueryFactory', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentAllAgentsSuccessRateTrendQueryFactory(context),
            ).toEqual(aiAgentAllAgentsSuccessRateTrend.build(context))
        })
    })
})

describe('aiSupportAgentSuccessRateTrend', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    it('builds query with correct metricName, scope, measures, and aiAgentRole fixed filter', () => {
        const actual = aiSupportAgentSuccessRateTrend.build(context)

        expect(actual).toMatchObject({
            metricName: 'ai-agent-support-agent-success-rate',
            scope: 'ai-agent-success-rate',
            measures: ['successRate'],
        })
        expect(actual.filters).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
                values: ['ai-agent-support'],
            }),
        )
    })

    describe('aiSupportAgentSuccessRateTrendQueryFactory', () => {
        it('returns the same result as calling build directly', () => {
            expect(aiSupportAgentSuccessRateTrendQueryFactory(context)).toEqual(
                aiSupportAgentSuccessRateTrend.build(context),
            )
        })
    })
})

describe('aiAgentSuccessRatePerChannel', () => {
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
        const actual = aiAgentSuccessRatePerChannel.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-success-rate-per-channel',
            scope: 'ai-agent-success-rate',
            measures: ['successRate'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('aiAgentSuccessRatePerChannelQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(aiAgentSuccessRatePerChannelQueryFactoryV2(context)).toEqual(
                aiAgentSuccessRatePerChannel.build(context),
            )
        })
    })
})

describe('successRatePerIntent', () => {
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
        const actual = aiAgentSuccessRatePerIntent.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-success-rate-per-intent',
            scope: 'ai-agent-success-rate',
            measures: ['successRate'],
            dimensions: ['aiIntentCustomField'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('successRatePerIntentQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(aiAgentSuccessRatePerIntentQueryFactoryV2(context)).toEqual(
                aiAgentSuccessRatePerIntent.build(context),
            )
        })
    })
})

describe('aiAgentShoppingAssistantSuccessRateTrend', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    it('builds query with correct metricName, scope, measures, and aiAgentRole fixed filter', () => {
        const actual = aiAgentShoppingAssistantSuccessRateTrend.build(context)

        expect(actual).toMatchObject({
            metricName: 'ai-agent-shopping-assistant-success-rate',
            scope: 'ai-agent-success-rate',
            measures: ['successRate'],
        })
        expect(actual.filters).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
                values: ['ai-agent-sales'],
            }),
        )
    })

    describe('aiAgentShoppingAssistantSuccessRateTrendQueryFactory', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentShoppingAssistantSuccessRateTrendQueryFactory(context),
            ).toEqual(aiAgentShoppingAssistantSuccessRateTrend.build(context))
        })
    })
})

describe('aiSupportAgentSuccessRatePerIntent', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = { filters, timezone }

    it('builds query with correct metricName, scope, measures, dimensions, and aiAgentRole fixed filter', () => {
        const actual = aiSupportAgentSuccessRatePerIntent.build(context)

        expect(actual).toMatchObject({
            metricName: 'ai-agent-support-success-rate-per-intent',
            scope: 'ai-agent-success-rate',
            measures: ['successRate'],
            dimensions: ['aiIntentCustomField'],
        })
        expect(actual.filters).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
                values: ['ai-agent-support'],
            }),
        )
    })

    describe('aiSupportAgentSuccessRatePerIntentQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiSupportAgentSuccessRatePerIntentQueryFactoryV2(context),
            ).toEqual(aiSupportAgentSuccessRatePerIntent.build(context))
        })
    })
})

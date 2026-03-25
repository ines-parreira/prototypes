import {
    aiAgentSuccessRatePerChannel,
    aiAgentSuccessRatePerChannelQueryFactoryV2,
    aiAgentSuccessRatePerIntent,
    aiAgentSuccessRatePerIntentQueryFactoryV2,
    aiAgentSuccessRateScope,
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
            aiAgentSuccessRateScope.config,
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
            aiAgentSuccessRateScope.config,
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
            dimensions: ['customField'],
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

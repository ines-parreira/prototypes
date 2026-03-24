import {
    aiAgentCoverageRatePerChannel,
    aiAgentCoverageRatePerChannelQueryFactoryV2,
    aiAgentCoverageRateScope,
    coverageRate,
    coverageRateQueryV2Factory,
} from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentCoverageRateScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentCoverageRateScope.config,
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
            aiAgentCoverageRateScope.config,
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
            aiAgentCoverageRateScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'aiAgentSkill' }),
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
            aiAgentCoverageRateScope.config,
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
            aiAgentCoverageRateScope.config,
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
            aiAgentCoverageRateScope.config,
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
            aiAgentCoverageRateScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('coverageRate', () => {
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

    it('builds query with correct metricName, scope, measures, and filters', () => {
        const actual = coverageRate.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-all-agents-coverage-rate',
            scope: 'ai-agent-coverage-rate',
            measures: ['coverageRate'],
            dimensions: undefined,
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('coverageRateQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(coverageRateQueryV2Factory(context)).toEqual(
                coverageRate.build(context),
            )
        })
    })
})

describe('aiAgentCoverageRatePerChannel', () => {
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
        const actual = aiAgentCoverageRatePerChannel.build(context)

        expect(actual).toEqual({
            metricName: 'ai-agent-coverage-rate-per-channel',
            scope: 'ai-agent-coverage-rate',
            measures: ['coverageRate'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: periodFilters,
        })
    })

    describe('aiAgentCoverageRatePerChannelQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentCoverageRatePerChannelQueryFactoryV2(context),
            ).toEqual(aiAgentCoverageRatePerChannel.build(context))
        })
    })
})

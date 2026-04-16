import {
    aiAgentCsatScope,
    averageAiAgentCsatSupportAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/aiAgentCsat'
import type { FilterGroup } from 'domains/reporting/models/scopes/types'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentCsatScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(baseFilters, aiAgentCsatScope.config)

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

    it('includes channel filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            channels: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['email'],
            },
        }
        const result = createScopeFilters(filters, aiAgentCsatScope.config)

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(baseFilters, aiAgentCsatScope.config)

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
        const result = createScopeFilters(filters, aiAgentCsatScope.config)

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'engagementType',
                operator: 'one-of',
            }),
        )
    })

    it('omits engagementType filter when not provided', () => {
        const result = createScopeFilters(baseFilters, aiAgentCsatScope.config)

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'engagementType' }),
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
        const result = createScopeFilters(filters, aiAgentCsatScope.config)

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
            }),
        )
    })

    it('omits aiAgentRole filter when not provided', () => {
        const result = createScopeFilters(baseFilters, aiAgentCsatScope.config)

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'aiAgentRole' }),
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
        const result = createScopeFilters(filters, aiAgentCsatScope.config)

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'integrationId',
                operator: 'one-of',
            }),
        )
    })

    it('omits storeIntegrationId filter when not provided', () => {
        const result = createScopeFilters(baseFilters, aiAgentCsatScope.config)

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('averageAiAgentCsatSupportAgentQueryV2Factory', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('always includes aiAgentRole = ai-agent-support filter', () => {
        const query = averageAiAgentCsatSupportAgentQueryV2Factory({
            filters: baseFilters,
            timezone: 'UTC',
        })

        expect(query.filters).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
                values: ['ai-agent-support'],
            }),
        )
    })

    it('includes aiAgentRole filter even when other filters are provided', () => {
        const query = averageAiAgentCsatSupportAgentQueryV2Factory({
            filters: {
                ...baseFilters,
                channels: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['email'],
                },
            },
            timezone: 'UTC',
        })

        expect(query.filters).toContainEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
                values: ['ai-agent-support'],
            }),
        )
        expect(query.filters).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('overrides any aiAgentRole from input filters', () => {
        const query = averageAiAgentCsatSupportAgentQueryV2Factory({
            filters: {
                ...baseFilters,
                aiAgentRole: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: ['ai-agent-sales'],
                },
            },
            timezone: 'UTC',
        })

        const aiAgentRoleFilters = query.filters?.filter(
            (f: FilterGroup) => f.member === 'aiAgentRole',
        )
        expect(aiAgentRoleFilters).toHaveLength(1)
        expect(aiAgentRoleFilters![0]).toEqual(
            expect.objectContaining({
                member: 'aiAgentRole',
                operator: 'one-of',
                values: ['ai-agent-support'],
            }),
        )
    })
})

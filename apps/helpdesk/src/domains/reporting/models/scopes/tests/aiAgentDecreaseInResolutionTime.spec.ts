import { aiAgentDecreaseInResolutionTimeScope } from 'domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentDecreaseInResolutionTimeScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
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
                values: ['ai-agent-support'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentDecreaseInResolutionTimeScope.config,
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
            aiAgentDecreaseInResolutionTimeScope.config,
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
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
        )
    })

    it('includes customField filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            customField: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['my-field'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'customField',
                operator: 'one-of',
            }),
        )
    })

    it('omits customField filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'customField' }),
        )
    })

    it('includes customFieldId filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            customFieldId: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [42],
            },
        }
        const result = createScopeFilters(
            filters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'customFieldId',
                operator: 'one-of',
            }),
        )
    })

    it('omits customFieldId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'customFieldId' }),
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
            aiAgentDecreaseInResolutionTimeScope.config,
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
            aiAgentDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

import { overallDecreaseInFirstResponseTimeScope } from 'domains/reporting/models/scopes/overallDecreaseInFirstResponseTime'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('overallDecreaseInFirstResponseTimeScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            overallDecreaseInFirstResponseTimeScope.config,
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

    it('includes automationFeatureType filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            automationFeatureType: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['ai-agent'],
            },
        }
        const result = createScopeFilters(
            filters,
            overallDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'automationFeatureType',
                operator: 'one-of',
            }),
        )
    })

    it('omits automationFeatureType filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            overallDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'automationFeatureType' }),
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
            overallDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            overallDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
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
            overallDecreaseInFirstResponseTimeScope.config,
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
            overallDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

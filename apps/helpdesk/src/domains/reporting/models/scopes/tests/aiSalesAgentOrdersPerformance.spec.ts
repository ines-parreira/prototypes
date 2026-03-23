import { aiSalesAgentOrdersPerformanceScope } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiSalesAgentOrdersPerformanceScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
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
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
        )
    })

    it('includes currency filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            currency: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['USD'],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'currency', operator: 'one-of' }),
        )
    })

    it('omits currency filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'currency' }),
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
            aiSalesAgentOrdersPerformanceScope.config,
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
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'engagementType' }),
        )
    })

    it('includes orderId filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            orderId: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123],
            },
        }
        const result = createScopeFilters(
            filters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'orderId', operator: 'one-of' }),
        )
    })

    it('omits orderId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'orderId' }),
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
            aiSalesAgentOrdersPerformanceScope.config,
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
            aiSalesAgentOrdersPerformanceScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

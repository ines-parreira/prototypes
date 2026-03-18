import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    aiSalesAgentActivityScope,
    revenuePerInteraction,
    revenuePerInteractionQueryV2Factory,
} from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiSalesAgentActivityScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
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
            aiSalesAgentActivityScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('revenuePerInteractionQueryV2Factory', () => {
    const context = {
        filters: {
            period: {
                start_datetime: '2025-09-03T00:00:00.000',
                end_datetime: '2025-09-03T23:59:59.000',
            },
        },
        timezone: 'UTC',
    }

    it('returns the same result as calling build directly', () => {
        expect(revenuePerInteractionQueryV2Factory(context)).toEqual(
            revenuePerInteraction.build(context),
        )
    })

    it('sets the correct metricName', () => {
        const result = revenuePerInteractionQueryV2Factory(context)
        expect(result.metricName).toBe(
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
        )
    })

    it('queries the revenuePerInteraction measure', () => {
        const result = revenuePerInteractionQueryV2Factory(context)
        expect(result.measures).toContain('revenuePerInteraction')
    })
})

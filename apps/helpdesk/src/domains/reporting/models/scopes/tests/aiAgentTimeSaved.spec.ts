import {
    aiAgentTimeSavedScope,
    overallTimeSavedByAgentPerChannel,
    overallTimeSavedByAgentPerChannelQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentTimeSavedScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentTimeSavedScope.config,
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
        const result = createScopeFilters(filters, aiAgentTimeSavedScope.config)

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
            aiAgentTimeSavedScope.config,
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
        const result = createScopeFilters(filters, aiAgentTimeSavedScope.config)

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentTimeSavedScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'channel' }),
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
        const result = createScopeFilters(filters, aiAgentTimeSavedScope.config)

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
            aiAgentTimeSavedScope.config,
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
        const result = createScopeFilters(filters, aiAgentTimeSavedScope.config)

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
            aiAgentTimeSavedScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('overallTimeSavedByAgentPerChannel', () => {
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

    it('builds query with correct metricName, scope, measures, dimensions, and aiAgentSkill filter', () => {
        expect(overallTimeSavedByAgentPerChannel.build(context)).toEqual({
            metricName: 'ai-agent-support-agent-time-saved-per-channel',
            scope: 'ai-agent-time-saved',
            measures: ['averageTimeSavedByAgent'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: [
                ...periodFilters,
                {
                    member: 'aiAgentSkill',
                    operator: 'one-of',
                    values: ['ai-agent-support'],
                },
            ],
        })
    })

    describe('overallTimeSavedByAgentPerChannelQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                overallTimeSavedByAgentPerChannelQueryFactoryV2(context),
            ).toEqual(overallTimeSavedByAgentPerChannel.build(context))
        })
    })
})

import {
    aiAgentSupportAgentTimeSavedPerIntent,
    aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2,
    aiAgentTimeSavedScope,
    dynamicAllAgentsTimeSaved,
    dynamicAllAgentsTimeSavedQueryFactoryV2,
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

    it('includes aiAgentRole filter when provided', () => {
        const filters: ApiStatsFilters = {
            ...baseFilters,
            aiAgentRole: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['support'],
            },
        }
        const result = createScopeFilters(filters, aiAgentTimeSavedScope.config)

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
            aiAgentTimeSavedScope.config,
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

    it('builds query with correct metricName, scope, measures, dimensions, and aiAgentRole filter', () => {
        expect(overallTimeSavedByAgentPerChannel.build(context)).toEqual({
            metricName: 'ai-agent-support-agent-time-saved-per-channel',
            scope: 'ai-agent-time-saved',
            measures: ['averageTimeSavedByAgent'],
            dimensions: ['channel'],
            timezone: 'utc',
            filters: [
                ...periodFilters,
                {
                    member: 'aiAgentRole',
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

describe('aiAgentSupportAgentTimeSavedPerIntent', () => {
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

    it('builds query with correct metricName, scope, measures, dimensions, and aiAgentRole filter', () => {
        expect(aiAgentSupportAgentTimeSavedPerIntent.build(context)).toEqual({
            metricName: 'ai-agent-support-agent-time-saved-per-intent',
            scope: 'ai-agent-time-saved',
            measures: ['averageTimeSavedByAgent'],
            dimensions: ['aiIntentCustomField'],
            timezone: 'utc',
            filters: [
                ...periodFilters,
                {
                    member: 'aiAgentRole',
                    operator: 'one-of',
                    values: ['ai-agent-support'],
                },
            ],
        })
    })

    describe('aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2(context),
            ).toEqual(aiAgentSupportAgentTimeSavedPerIntent.build(context))
        })
    })
})

describe('dynamicAiAgentTimeSaved', () => {
    const baseFilters: StatsFilters = {
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

    describe('dynamicAllAgentsTimeSaved', () => {
        it('creates query without dimensions when no dimension provided', () => {
            expect(
                dynamicAllAgentsTimeSaved.build({
                    ...context,
                    dimensions: [],
                }),
            ).toEqual({
                metricName: 'ai-agent-dynamic-all-agents-time-saved-by-agent',
                scope: 'ai-agent-time-saved',
                measures: ['averageTimeSavedByAgent'],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('creates query with the provided dimension', () => {
            expect(
                dynamicAllAgentsTimeSaved.build({
                    ...context,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName: 'ai-agent-dynamic-all-agents-time-saved-by-agent',
                scope: 'ai-agent-time-saved',
                measures: ['averageTimeSavedByAgent'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })
    })

    describe('dynamicAllAgentsTimeSavedQueryFactoryV2', () => {
        it('returns query with empty dimensions when no dimension provided', () => {
            const result = dynamicAllAgentsTimeSavedQueryFactoryV2({
                ...context,
                dimensions: [],
            })

            expect(result).toEqual({
                metricName: 'ai-agent-dynamic-all-agents-time-saved-by-agent',
                scope: 'ai-agent-time-saved',
                measures: ['averageTimeSavedByAgent'],
                dimensions: [],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('returns query with the provided dimension', () => {
            const result = dynamicAllAgentsTimeSavedQueryFactoryV2({
                ...context,
                dimensions: ['storeIntegrationId'],
            })

            expect(result).toEqual({
                metricName: 'ai-agent-dynamic-all-agents-time-saved-by-agent',
                scope: 'ai-agent-time-saved',
                measures: ['averageTimeSavedByAgent'],
                dimensions: ['storeIntegrationId'],
                timezone: 'utc',
                filters: periodFilters,
            })
        })

        it('returns the same result as calling build directly with the dimension', () => {
            const ctx = { ...context, dimensions: ['channel'] as const }

            expect(dynamicAllAgentsTimeSavedQueryFactoryV2(ctx)).toEqual(
                dynamicAllAgentsTimeSaved.build(ctx),
            )
        })
    })
})

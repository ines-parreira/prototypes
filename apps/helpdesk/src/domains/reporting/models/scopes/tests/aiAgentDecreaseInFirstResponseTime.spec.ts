import {
    aiAgentDecreaseInFirstResponseTimeScope,
    aiAgentSupportAgentDecreaseInFRT,
    aiAgentSupportAgentDecreaseInFRTPerChannel,
    aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2,
    aiAgentSupportAgentDecreaseInFRTPerIntent,
    aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2,
    aiAgentSupportAgentDecreaseInFRTQueryV2Factory,
    dynamicAiAgentDecreaseInFRT,
    dynamicAiAgentDecreaseInFRTQueryFactoryV2,
    dynamicSupportAgentDecreaseInFRT,
    dynamicSupportAgentDecreaseInFRTQueryFactoryV2,
    dynamicSupportAgentDecreaseInFRTTimeseries,
    dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('aiAgentDecreaseInFirstResponseTimeScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'engagementType' }),
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
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
            aiAgentDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({
                member: 'storeIntegrationId',
                operator: 'one-of',
            }),
        )
    })

    it('omits storeIntegrationId filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            aiAgentDecreaseInFirstResponseTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })
})

describe('aiAgentSupportAgentDecreaseInFRTPerChannel', () => {
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
        expect(
            aiAgentSupportAgentDecreaseInFRTPerChannel.build(context),
        ).toEqual({
            metricName:
                'ai-agent-support-agent-decrease-in-first-response-time-per-channel',
            scope: 'ai-agent-decrease-in-first-response-time',
            measures: ['medianDecreaseInFirstResponseTime'],
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

    describe('aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentSupportAgentDecreaseInFRTPerChannelQueryFactoryV2(
                    context,
                ),
            ).toEqual(aiAgentSupportAgentDecreaseInFRTPerChannel.build(context))
        })
    })
})

describe('aiAgentSupportAgentDecreaseInFRT', () => {
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

    it('builds query with correct metricName, scope, measures, and aiAgentRole filter', () => {
        expect(aiAgentSupportAgentDecreaseInFRT.build(context)).toEqual({
            metricName: 'ai-agent-support-agent-decrease-in-frt',
            scope: 'ai-agent-decrease-in-first-response-time',
            measures: ['medianDecreaseInFirstResponseTime'],
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

    describe('aiAgentSupportAgentDecreaseInFRTQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentSupportAgentDecreaseInFRTQueryV2Factory(context),
            ).toEqual(aiAgentSupportAgentDecreaseInFRT.build(context))
        })
    })
})

describe('aiAgentSupportAgentDecreaseInFRTPerIntent', () => {
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
        expect(
            aiAgentSupportAgentDecreaseInFRTPerIntent.build(context),
        ).toEqual({
            metricName:
                'ai-agent-support-agent-decrease-in-first-response-time-per-intent',
            scope: 'ai-agent-decrease-in-first-response-time',
            measures: ['medianDecreaseInFirstResponseTime'],
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

    describe('aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            expect(
                aiAgentSupportAgentDecreaseInFRTPerIntentQueryFactoryV2(
                    context,
                ),
            ).toEqual(aiAgentSupportAgentDecreaseInFRTPerIntent.build(context))
        })
    })
})

describe('dynamicSupportAgentDecreaseInFRT', () => {
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

    const supportSkillFilter = {
        member: 'aiAgentRole',
        operator: 'one-of',
        values: ['ai-agent-support'],
    }

    describe('dynamicSupportAgentDecreaseInFRT', () => {
        it('creates query without dimensions when no dimension provided', () => {
            expect(
                dynamicSupportAgentDecreaseInFRT.build({
                    ...context,
                    dimensions: [],
                }),
            ).toEqual({
                metricName: 'ai-agent-dynamic-support-agent-decrease-in-frt',
                scope: 'ai-agent-decrease-in-first-response-time',
                measures: ['medianDecreaseInFirstResponseTime'],
                dimensions: [],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
            })
        })

        it('creates query with the provided dimension', () => {
            expect(
                dynamicSupportAgentDecreaseInFRT.build({
                    ...context,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName: 'ai-agent-dynamic-support-agent-decrease-in-frt',
                scope: 'ai-agent-decrease-in-first-response-time',
                measures: ['medianDecreaseInFirstResponseTime'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
            })
        })
    })

    describe('dynamicSupportAgentDecreaseInFRTQueryFactoryV2', () => {
        it('returns query with empty dimensions when no dimension provided', () => {
            const result = dynamicSupportAgentDecreaseInFRTQueryFactoryV2({
                ...context,
                dimensions: [],
            })

            expect(result).toEqual({
                metricName: 'ai-agent-dynamic-support-agent-decrease-in-frt',
                scope: 'ai-agent-decrease-in-first-response-time',
                measures: ['medianDecreaseInFirstResponseTime'],
                dimensions: [],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
            })
        })

        it('returns query with the provided dimension', () => {
            const result = dynamicSupportAgentDecreaseInFRTQueryFactoryV2({
                ...context,
                dimensions: ['storeIntegrationId'],
            })

            expect(result).toEqual({
                metricName: 'ai-agent-dynamic-support-agent-decrease-in-frt',
                scope: 'ai-agent-decrease-in-first-response-time',
                measures: ['medianDecreaseInFirstResponseTime'],
                dimensions: ['storeIntegrationId'],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
            })
        })

        it('returns the same result as calling build directly with the dimension', () => {
            const ctx = { ...context, dimensions: ['channel'] as const }

            expect(dynamicSupportAgentDecreaseInFRTQueryFactoryV2(ctx)).toEqual(
                dynamicSupportAgentDecreaseInFRT.build(ctx),
            )
        })
    })

    describe('dynamicSupportAgentDecreaseInFRTTimeseries', () => {
        it('creates timeseries query with granularity and support role filter', () => {
            expect(
                dynamicSupportAgentDecreaseInFRTTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: [],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-support-agent-decrease-in-frt-timeseries',
                scope: 'ai-agent-decrease-in-first-response-time',
                measures: ['medianDecreaseInFirstResponseTime'],
                dimensions: [],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                limit: 10000,
            })
        })

        it('creates timeseries query with the provided dimension', () => {
            expect(
                dynamicSupportAgentDecreaseInFRTTimeseries.build({
                    ...context,
                    granularity: 'day' as AggregationWindow,
                    dimensions: ['channel'],
                }),
            ).toEqual({
                metricName:
                    'ai-agent-dynamic-support-agent-decrease-in-frt-timeseries',
                scope: 'ai-agent-decrease-in-first-response-time',
                measures: ['medianDecreaseInFirstResponseTime'],
                dimensions: ['channel'],
                timezone: 'utc',
                filters: [...periodFilters, supportSkillFilter],
                time_dimensions: [
                    { dimension: 'eventDatetime', granularity: 'day' },
                ],
                limit: 10000,
            })
        })
    })

    describe('dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const ctx = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: ['channel'] as const,
            }

            expect(
                dynamicSupportAgentDecreaseInFRTTimeseriesQueryFactoryV2(ctx),
            ).toEqual(dynamicSupportAgentDecreaseInFRTTimeseries.build(ctx))
        })
    })
})

describe('dynamicAiAgentDecreaseInFRT', () => {
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

    it('creates query without dimensions when no dimension provided', () => {
        expect(
            dynamicAiAgentDecreaseInFRT.build({
                ...context,
                dimensions: [],
            }),
        ).toEqual({
            metricName:
                'ai-agent-decrease-in-first-response-time-breakdown-per-store',
            scope: 'ai-agent-decrease-in-first-response-time',
            measures: ['medianDecreaseInFirstResponseTime'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })

    it('creates query with the provided dimension', () => {
        expect(
            dynamicAiAgentDecreaseInFRT.build({
                ...context,
                dimensions: ['storeIntegrationId'],
            }),
        ).toEqual({
            metricName:
                'ai-agent-decrease-in-first-response-time-breakdown-per-store',
            scope: 'ai-agent-decrease-in-first-response-time',
            measures: ['medianDecreaseInFirstResponseTime'],
            dimensions: ['storeIntegrationId'],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })

    describe('dynamicAiAgentDecreaseInFRTQueryFactoryV2', () => {
        it('returns the same result as calling build directly', () => {
            const ctx = {
                ...context,
                dimensions: ['storeIntegrationId'] as const,
            }

            expect(dynamicAiAgentDecreaseInFRTQueryFactoryV2(ctx)).toEqual(
                dynamicAiAgentDecreaseInFRT.build(ctx),
            )
        })
    })
})

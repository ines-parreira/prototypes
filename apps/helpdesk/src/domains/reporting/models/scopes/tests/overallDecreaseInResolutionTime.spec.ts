import {
    overallDecreaseInResolutionTime,
    overallDecreaseInResolutionTimeQueryV2Factory,
    overallDecreaseInResolutionTimeScope,
    overallDecreaseInResolutionTimeTimeseries,
    overallDecreaseInResolutionTimeTimeseriesQueryV2Factory,
} from 'domains/reporting/models/scopes/overallDecreaseInResolutionTime'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('overallDecreaseInResolutionTimeScope', () => {
    const baseFilters: ApiStatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    it('includes period filters', () => {
        const result = createScopeFilters(
            baseFilters,
            overallDecreaseInResolutionTimeScope.config,
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
            overallDecreaseInResolutionTimeScope.config,
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
            overallDecreaseInResolutionTimeScope.config,
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
            overallDecreaseInResolutionTimeScope.config,
        )

        expect(result).toContainEqual(
            expect.objectContaining({ member: 'channel', operator: 'one-of' }),
        )
    })

    it('omits channel filter when not provided', () => {
        const result = createScopeFilters(
            baseFilters,
            overallDecreaseInResolutionTimeScope.config,
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
            overallDecreaseInResolutionTimeScope.config,
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
            overallDecreaseInResolutionTimeScope.config,
        )

        expect(result).not.toContainEqual(
            expect.objectContaining({ member: 'integrationId' }),
        )
    })

    describe('QueryV2Factory methods', () => {
        const context = { filters: baseFilters, timezone: 'UTC' }

        describe('overallDecreaseInResolutionTimeQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                expect(
                    overallDecreaseInResolutionTimeQueryV2Factory(context),
                ).toEqual(overallDecreaseInResolutionTime.build(context))
            })

            it('uses the median decrease in resolution time measure', () => {
                const result =
                    overallDecreaseInResolutionTimeQueryV2Factory(context)

                expect(result.measures).toEqual([
                    'medianDecreaseInResolutionTime',
                ])
            })
        })

        describe('overallDecreaseInResolutionTimeTimeseriesQueryV2Factory', () => {
            const timeseriesContext = {
                ...context,
                granularity: 'day' as AggregationWindow,
                dimensions: [],
            }

            it('returns the same result as calling build directly', () => {
                expect(
                    overallDecreaseInResolutionTimeTimeseriesQueryV2Factory(
                        timeseriesContext,
                    ),
                ).toEqual(
                    overallDecreaseInResolutionTimeTimeseries.build(
                        timeseriesContext,
                    ),
                )
            })

            it('creates a timeseries query with granularity from context', () => {
                const result =
                    overallDecreaseInResolutionTimeTimeseriesQueryV2Factory(
                        timeseriesContext,
                    )

                expect(result).toEqual(
                    expect.objectContaining({
                        measures: ['medianDecreaseInResolutionTime'],
                        time_dimensions: [
                            { dimension: 'eventDatetime', granularity: 'day' },
                        ],
                        limit: 10000,
                    }),
                )
            })
        })
    })
})

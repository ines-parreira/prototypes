import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    convertCampaignABTestEventsQueryFactoryV2,
    convertCampaignEventsOrdersPerformance,
    convertCampaignEventsOrdersPerformanceQueryFactoryV2,
    convertCampaignEventsTotals,
    convertCampaignEventsTotalsQueryFactoryV2,
    convertCampaignImpressionTimeSeries,
    convertCampaignImpressionTimeSeriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/convertCampaignOrderEvents'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

describe('convertCampaignOrderEvents scope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00',
            end_datetime: '2025-09-03T23:59:59',
        },
    }

    const timezone = 'UTC'
    const granularity = 'day' as AggregationWindow

    const context = {
        timezone,
        filters,
        granularity,
    }

    const scopeFilters = [
        {
            member: 'periodStart',
            operator: ReportingStatsOperatorsEnum.AfterDate,
            values: ['2025-09-03T00:00:00.000'],
        },
        {
            member: 'periodEnd',
            operator: ReportingStatsOperatorsEnum.BeforeDate,
            values: ['2025-09-03T23:59:59.000'],
        },
    ]

    describe('convertCampaignEventsOrdersPerformance', () => {
        it('creates query with performance measures', () => {
            const result = convertCampaignEventsOrdersPerformance.build(context)

            expect(result).toEqual({
                measures: ['engagement', 'totalConversionRate', 'campaignCTR'],
                filters: scopeFilters,
                timezone,
                time_dimensions: [
                    { dimension: 'createdDatetime', granularity: 'day' },
                ],
                metricName:
                    METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_ORDERS_PERFORMANCE,
                scope: MetricScope.ConvertCampaignOrderEvents,
            })
        })

        describe('convertCampaignEventsOrdersPerformanceQueryFactoryV2', () => {
            it('builds query with abVariant dimension', () => {
                const result =
                    convertCampaignEventsOrdersPerformanceQueryFactoryV2(
                        context,
                        'abVariant',
                    )

                expect(result.measures).toEqual([
                    'engagement',
                    'totalConversionRate',
                    'campaignCTR',
                ])
                expect(result.dimensions).toEqual(['abVariant'])
                expect(result.metricName).toBe(
                    METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_ORDERS_PERFORMANCE,
                )
                expect(result.scope).toBe(
                    MetricScope.ConvertCampaignOrderEvents,
                )
            })

            it('builds query with campaignId dimension', () => {
                const result =
                    convertCampaignEventsOrdersPerformanceQueryFactoryV2(
                        context,
                        'campaignId',
                    )

                expect(result.dimensions).toEqual(['campaignId'])
                expect(result.metricName).toBe(
                    METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_ORDERS_PERFORMANCE,
                )
            })
        })
    })

    describe('convertCampaignEventsTotals', () => {
        it('creates query with impressions and engagement measures', () => {
            const result = convertCampaignEventsTotals.build(context)

            expect(result).toEqual({
                measures: ['impressions', 'engagement'],
                filters: scopeFilters,
                timezone,
                time_dimensions: [
                    { dimension: 'createdDatetime', granularity: 'day' },
                ],
                metricName: METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_TOTALS,
                scope: MetricScope.ConvertCampaignOrderEvents,
            })
        })

        it('returns the same result as query factory', () => {
            const factoryResult =
                convertCampaignEventsTotalsQueryFactoryV2(context)
            const buildResult = convertCampaignEventsTotals.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('convertCampaignImpressionTimeSeries', () => {
        it('creates query with ascending time series order', () => {
            const result = convertCampaignImpressionTimeSeries.build(context)

            expect(result).toEqual({
                measures: ['impressions'],
                filters: scopeFilters,
                timezone,
                time_dimensions: [
                    { dimension: 'createdDatetime', granularity: 'day' },
                ],
                order: [['createdDatetime', 'asc']],
                metricName:
                    METRIC_NAMES.CONVERT_CAMPAIGN_IMPRESSION_TIME_SERIES,
                scope: MetricScope.ConvertCampaignOrderEvents,
            })
        })

        it('uses granularity from context', () => {
            const weeklyContext = {
                ...context,
                granularity: 'week' as AggregationWindow,
            }
            const result =
                convertCampaignImpressionTimeSeries.build(weeklyContext)

            expect(result.time_dimensions).toEqual([
                { dimension: 'createdDatetime', granularity: 'week' },
            ])
            expect(result.order).toEqual([['createdDatetime', 'asc']])
        })

        it('returns the same result as query factory', () => {
            const factoryResult =
                convertCampaignImpressionTimeSeriesQueryFactoryV2(context)
            const buildResult =
                convertCampaignImpressionTimeSeries.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('convertCampaignABTestEventsQueryFactoryV2', () => {
        it('builds query with order count and first campaign display measures', () => {
            const result = convertCampaignABTestEventsQueryFactoryV2(context)

            expect(result.measures).toEqual([
                'orderCount',
                'firstCampaignDisplay',
            ])
            expect(result.metricName).toBe(
                METRIC_NAMES.CONVERT_CAMPAIGN_AB_TEST_EVENTS,
            )
            expect(result.scope).toBe(MetricScope.ConvertCampaignOrderEvents)
        })

        it('includes scope filters', () => {
            const result = convertCampaignABTestEventsQueryFactoryV2(context)

            expect(result.filters).toEqual(scopeFilters)
            expect(result.timezone).toBe(timezone)
        })
    })
})

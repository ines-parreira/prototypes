import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    aiSalesAgentProductClicks,
    aiSalesAgentProductClicksQueryFactoryV2,
    aiSalesAgentUniqueClicksQueryFactoryV2,
    convertCampaignEventsPerformance,
    convertCampaignEventsPerformanceQueryFactoryV2,
} from 'domains/reporting/models/scopes/convertCampaignEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { CAMPAIGN_EVENTS } from 'domains/reporting/pages/convert/clients/constants'

describe('convertCampaignEvents scope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00',
            end_datetime: '2025-09-03T23:59:59',
        },
    }
    const timezone = 'UTC'

    const context = {
        timezone,
        filters,
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

    describe('convertCampaignEventsPerformance', () => {
        it('creates query with performance measures and campaign event type filter', () => {
            const result = convertCampaignEventsPerformance.build(context)

            expect(result).toEqual({
                measures: [
                    'impressions',
                    'firstCampaignDisplay',
                    'lastCampaignDisplay',
                    'clicks',
                    'clicksRate',
                    'ticketsCreated',
                ],
                filters: [
                    ...scopeFilters,
                    {
                        member: 'eventType',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: CAMPAIGN_EVENTS,
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_PERFORMANCE,
                scope: MetricScope.ConvertCampaignEvents,
            })
        })

        describe('convertCampaignEventsPerformanceQueryFactoryV2', () => {
            it('builds query with campaignId dimension', () => {
                const result = convertCampaignEventsPerformanceQueryFactoryV2(
                    context,
                    'campaignId',
                )

                expect(result.measures).toEqual([
                    'impressions',
                    'firstCampaignDisplay',
                    'lastCampaignDisplay',
                    'clicks',
                    'clicksRate',
                    'ticketsCreated',
                ])
                expect(result.dimensions).toEqual(['campaignId'])
                expect(result.metricName).toBe(
                    METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_PERFORMANCE,
                )
                expect(result.scope).toBe(MetricScope.ConvertCampaignEvents)
            })

            it('builds query with abVariant dimension', () => {
                const result = convertCampaignEventsPerformanceQueryFactoryV2(
                    context,
                    'abVariant',
                )

                expect(result.dimensions).toEqual(['abVariant'])
                expect(result.metricName).toBe(
                    METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_PERFORMANCE,
                )
            })
        })
    })

    describe('aiSalesAgentProductClicks', () => {
        it('creates query with uniqClicks measure, productId dimension, and ai-agent source filter', () => {
            const result = aiSalesAgentProductClicks.build(context)

            expect(result).toEqual({
                measures: ['uniqClicks'],
                dimensions: ['productId'],
                filters: [
                    ...scopeFilters,
                    {
                        member: 'source',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['ai-agent'],
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.AI_SALES_AGENT_PRODUCT_CLICKS,
                scope: MetricScope.ConvertCampaignEvents,
            })
        })

        it('returns the same result as query factory', () => {
            const factoryResult =
                aiSalesAgentProductClicksQueryFactoryV2(context)
            const buildResult = aiSalesAgentProductClicks.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('aiSalesAgentUniqueClicks', () => {
        it('creates query with uniqClicks measure and ai-agent source filter', () => {
            const result = aiSalesAgentUniqueClicksQueryFactoryV2(context)

            expect(result).toEqual({
                measures: ['uniqClicks'],
                filters: [
                    ...scopeFilters,
                    {
                        member: 'source',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['ai-agent'],
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.AI_SALES_AGENT_UNIQUE_CLICKS,
                scope: MetricScope.ConvertCampaignEvents,
            })
        })
    })
})

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

import {
    aiJourneyClickThroughRateDrillDownQueryFactory,
    aiJourneyDiscountCodesGeneratedDrillDownQueryFactory,
    aiJourneyDiscountCodesUsedDrillDownQueryFactory,
    aiJourneyOptOutRateDrillDownQueryFactory,
    aiJourneyOrdersDrillDownQueryFactory,
    aiJourneyResponseRateDrillDownQueryFactory,
} from './aiJourneyDrillDownQueries'

describe('aiJourneyDrillDownQueries', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2025-08-29T12:00:00',
            end_datetime: '2025-09-05T12:00:00',
        },
    }
    const timezone = 'America/New_York'
    const integrationId = '12345'
    const journeyId = 'journey-123'

    describe('aiJourneyOrdersDrillDownQueryFactory', () => {
        it('should produce query without sorting and journeyId', () => {
            const query = aiJourneyOrdersDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
            )

            expect(query).toEqual({
                dimensions: [
                    'AiSalesAgentOrders.ticketId',
                    'AiSalesAgentOrders.orderId',
                    'AiSalesAgentOrders.totalAmount',
                    'AiSalesAgentOrders.customerId',
                ],
                filters: [
                    {
                        member: 'AiSalesAgentOrders.isInfluenced',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentOrders.integrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentOrders.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: ['AiSalesAgentOrders.gmvUsd'],
                metricName: 'ai-journey-total-number-of-order',
                order: [],
                timezone,
            })
        })

        it('should produce query with sorting', () => {
            const sorting = OrderDirection.Desc
            const query = aiJourneyOrdersDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
            )

            expect(query).toEqual({
                dimensions: [
                    'AiSalesAgentOrders.ticketId',
                    'AiSalesAgentOrders.orderId',
                    'AiSalesAgentOrders.totalAmount',
                    'AiSalesAgentOrders.customerId',
                ],
                filters: [
                    {
                        member: 'AiSalesAgentOrders.isInfluenced',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentOrders.integrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentOrders.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: ['AiSalesAgentOrders.gmvUsd'],
                metricName: 'ai-journey-total-number-of-order',
                order: [['AiSalesAgentOrders.ticketId', 'desc']],
                timezone,
            })
        })

        it('should produce query with journeyId', () => {
            const query = aiJourneyOrdersDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                undefined,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: [
                    'AiSalesAgentOrders.ticketId',
                    'AiSalesAgentOrders.orderId',
                    'AiSalesAgentOrders.totalAmount',
                    'AiSalesAgentOrders.customerId',
                ],
                filters: [
                    {
                        member: 'AiSalesAgentOrders.isInfluenced',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentOrders.integrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentOrders.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: ['AiSalesAgentOrders.gmvUsd'],
                metricName: 'ai-journey-total-number-of-order',
                order: [],
                timezone,
            })
        })

        it('should produce query with both sorting and journeyId', () => {
            const sorting = OrderDirection.Asc
            const query = aiJourneyOrdersDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: [
                    'AiSalesAgentOrders.ticketId',
                    'AiSalesAgentOrders.orderId',
                    'AiSalesAgentOrders.totalAmount',
                    'AiSalesAgentOrders.customerId',
                ],
                filters: [
                    {
                        member: 'AiSalesAgentOrders.isInfluenced',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentOrders.integrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentOrders.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: ['AiSalesAgentOrders.gmvUsd'],
                metricName: 'ai-journey-total-number-of-order',
                order: [['AiSalesAgentOrders.ticketId', 'asc']],
                timezone,
            })
        })
    })

    describe('aiJourneyResponseRateDrillDownQueryFactory', () => {
        it('should produce query without sorting and journeyId', () => {
            const query = aiJourneyResponseRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.replied',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'notEquals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-replied-messages',
                order: [],
                timezone,
            })
        })

        it('should produce query with sorting', () => {
            const sorting = OrderDirection.Desc
            const query = aiJourneyResponseRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.replied',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'notEquals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-replied-messages',
                order: [['AiSalesAgentConversations.ticketId', 'desc']],
                timezone,
            })
        })

        it('should produce query with journeyId', () => {
            const query = aiJourneyResponseRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                undefined,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.replied',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'notEquals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-replied-messages',
                order: [],
                timezone,
            })
        })

        it('should produce query with both sorting and journeyId', () => {
            const sorting = OrderDirection.Asc
            const query = aiJourneyResponseRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.replied',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'notEquals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-replied-messages',
                order: [['AiSalesAgentConversations.ticketId', 'asc']],
                timezone,
            })
        })
    })

    describe('aiJourneyOptOutRateDrillDownQueryFactory', () => {
        it('should produce query without sorting and journeyId', () => {
            const query = aiJourneyOptOutRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'equals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-opted-out-conversations',
                order: [],
                timezone,
            })
        })

        it('should produce query with sorting', () => {
            const sorting = OrderDirection.Desc
            const query = aiJourneyOptOutRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'equals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-opted-out-conversations',
                order: [['AiSalesAgentConversations.ticketId', 'desc']],
                timezone,
            })
        })

        it('should produce query with journeyId', () => {
            const query = aiJourneyOptOutRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                undefined,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'equals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-opted-out-conversations',
                order: [],
                timezone,
            })
        })

        it('should produce query with both sorting and journeyId', () => {
            const sorting = OrderDirection.Asc
            const query = aiJourneyOptOutRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyCompleteReason',
                        operator: 'equals',
                        values: ['Eligibility::Shopper Opted Out'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-opted-out-conversations',
                order: [['AiSalesAgentConversations.ticketId', 'asc']],
                timezone,
            })
        })
    })

    describe('aiJourneyClickThroughRateDrillDownQueryFactory', () => {
        it('should produce query without sorting and journeyId', () => {
            const query = aiJourneyClickThroughRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.clicked',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-uniq-clicks',
                order: [],
                timezone,
            })
        })

        it('should produce query with sorting', () => {
            const sorting = OrderDirection.Desc
            const query = aiJourneyClickThroughRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.clicked',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-uniq-clicks',
                order: [['AiSalesAgentConversations.ticketId', 'desc']],
                timezone,
            })
        })

        it('should produce query with journeyId', () => {
            const query = aiJourneyClickThroughRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                undefined,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.clicked',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-uniq-clicks',
                order: [],
                timezone,
            })
        })

        it('should produce query with both sorting and journeyId', () => {
            const sorting = OrderDirection.Asc
            const query = aiJourneyClickThroughRateDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
                journeyId ? [journeyId] : undefined,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.clicked',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.journeyId',
                        operator: 'equals',
                        values: ['journey-123'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-journey-uniq-clicks',
                order: [['AiSalesAgentConversations.ticketId', 'asc']],
                timezone,
            })
        })
    })

    describe('aiJourneyDiscountCodesGeneratedDrillDownQueryFactory', () => {
        it('should produce query without sorting and journeyId', () => {
            const query = aiJourneyDiscountCodesGeneratedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
            )

            expect(query).toEqual({
                dimensions: ['AiSalesAgentConversations.ticketId'],
                filters: [
                    {
                        member: 'AiSalesAgentConversations.isSalesOpportunity',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentConversations.discountCode',
                        operator: 'set',
                        values: [],
                    },
                    {
                        member: 'AiSalesAgentConversations.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentConversations.storeIntegrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentConversations.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: [],
                metricName: 'ai-sales-agent-discount-codes-offered',
                order: [],
                timezone,
            })
        })

        it('should produce query with sorting', () => {
            const sorting = OrderDirection.Desc
            const query = aiJourneyDiscountCodesGeneratedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
            )

            expect(query.order).toEqual([
                ['AiSalesAgentConversations.ticketId', 'desc'],
            ])
        })

        it('should produce query with journeyId', () => {
            const query = aiJourneyDiscountCodesGeneratedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                undefined,
                [journeyId],
            )

            expect(query.filters).toContainEqual({
                member: 'AiSalesAgentConversations.journeyId',
                operator: 'equals',
                values: ['journey-123'],
            })
        })

        it('should produce query with both sorting and journeyId', () => {
            const sorting = OrderDirection.Asc
            const query = aiJourneyDiscountCodesGeneratedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
                [journeyId],
            )

            expect(query.order).toEqual([
                ['AiSalesAgentConversations.ticketId', 'asc'],
            ])
            expect(query.filters).toContainEqual({
                member: 'AiSalesAgentConversations.journeyId',
                operator: 'equals',
                values: ['journey-123'],
            })
        })
    })

    describe('aiJourneyDiscountCodesUsedDrillDownQueryFactory', () => {
        it('should produce query without sorting and journeyId', () => {
            const query = aiJourneyDiscountCodesUsedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
            )

            expect(query).toEqual({
                dimensions: [
                    'AiSalesAgentOrders.ticketId',
                    'AiSalesAgentOrders.orderId',
                    'AiSalesAgentOrders.totalAmount',
                    'AiSalesAgentOrders.customerId',
                ],
                filters: [
                    {
                        member: 'AiSalesAgentOrders.isInfluenced',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'AiSalesAgentOrders.influencedBy',
                        operator: 'equals',
                        values: ['discount-code'],
                    },
                    {
                        member: 'AiSalesAgentOrders.source',
                        operator: 'equals',
                        values: ['ai-journey'],
                    },
                    {
                        member: 'AiSalesAgentOrders.integrationId',
                        operator: 'equals',
                        values: ['12345'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodStart',
                        operator: 'afterDate',
                        values: ['2025-08-29T12:00:00.000'],
                    },
                    {
                        member: 'AiSalesAgentOrders.periodEnd',
                        operator: 'beforeDate',
                        values: ['2025-09-05T12:00:00.000'],
                    },
                ],
                limit: 100,
                measures: ['AiSalesAgentOrders.gmvUsd'],
                metricName: 'ai-sales-agent-discount-codes-applied',
                order: [],
                timezone,
            })
        })

        it('should produce query with sorting', () => {
            const sorting = OrderDirection.Desc
            const query = aiJourneyDiscountCodesUsedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
            )

            expect(query.order).toEqual([
                ['AiSalesAgentOrders.ticketId', 'desc'],
            ])
        })

        it('should produce query with journeyId', () => {
            const query = aiJourneyDiscountCodesUsedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                undefined,
                [journeyId],
            )

            expect(query.filters).toContainEqual({
                member: 'AiSalesAgentOrders.journeyId',
                operator: 'equals',
                values: ['journey-123'],
            })
        })

        it('should produce query with both sorting and journeyId', () => {
            const sorting = OrderDirection.Asc
            const query = aiJourneyDiscountCodesUsedDrillDownQueryFactory(
                statsFilters,
                timezone,
                integrationId,
                sorting,
                [journeyId],
            )

            expect(query.order).toEqual([
                ['AiSalesAgentOrders.ticketId', 'asc'],
            ])
            expect(query.filters).toContainEqual({
                member: 'AiSalesAgentOrders.journeyId',
                operator: 'equals',
                values: ['journey-123'],
            })
        })
    })
})

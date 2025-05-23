import { OrderDirection } from 'models/api/types'
import { AiSalesAgentConversationsDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { aiSalesAgentConversationsDefaultFiltersMembers } from 'models/reporting/queryFactories/ai-sales-agent/filters'
import {
    discountCodesOfferedDrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { ReportingFilterOperator } from 'models/reporting/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

describe('totalNumberofSalesOpportunityConvFromAIAgentDrillDownQueryFactory', () => {
    it('should build a query', () => {
        expect(
            totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
            ),
        ).toEqual({
            measures: [],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.Outcome,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with sorting', () => {
        expect(
            totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                OrderDirection.Asc,
            ),
        ).toEqual({
            measures: [],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.Outcome,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [
                    AiSalesAgentConversationsDimension.TicketId,
                    OrderDirection.Asc,
                ],
            ],
            timezone: 'UTC',
        })
    })
})

describe('totalNumberOfAutomatedSalesDrillDownQueryFactory', () => {
    it('should build a query', () => {
        expect(
            totalNumberOfAutomatedSalesDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
            ),
        ).toEqual({
            measures: [],
            dimensions: [AiSalesAgentConversationsDimension.TicketId],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.Outcome,
                    operator: ReportingFilterOperator.NotEquals,
                    values: ['handover'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with sorting', () => {
        expect(
            totalNumberOfAutomatedSalesDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                OrderDirection.Desc,
            ),
        ).toEqual({
            measures: [],
            dimensions: [AiSalesAgentConversationsDimension.TicketId],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.Outcome,
                    operator: ReportingFilterOperator.NotEquals,
                    values: ['handover'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [
                    AiSalesAgentConversationsDimension.TicketId,
                    OrderDirection.Desc,
                ],
            ],
            timezone: 'UTC',
        })
    })
})

describe('discountCodesOfferedDrillDownQueryFactory', () => {
    it('should build a query', () => {
        expect(
            discountCodesOfferedDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
            ),
        ).toEqual({
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [AiSalesAgentConversationsDimension.TicketId],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.DiscountCode,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with sorting', () => {
        expect(
            discountCodesOfferedDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                OrderDirection.Desc,
            ),
        ).toEqual({
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [AiSalesAgentConversationsDimension.TicketId],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.DiscountCode,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [
                    AiSalesAgentConversationsDimension.TicketId,
                    OrderDirection.Desc,
                ],
            ],
            timezone: 'UTC',
        })
    })
})

describe('totalNumberOfOrderDrillDownQueryFactory', () => {
    it('should build a query', () => {
        expect(
            totalNumberOfOrderDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
            ),
        ).toEqual({
            measures: ['AiSalesAgentOrders.gmv'],
            dimensions: [
                AiSalesAgentOrdersDimension.TicketId,
                AiSalesAgentOrdersDimension.OrderId,
                AiSalesAgentOrdersDimension.TotalAmount,
                AiSalesAgentOrdersDimension.CustomerId,
            ],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.IsInfluenced,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentOrdersDimension.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: AiSalesAgentOrdersDimension.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with sorting', () => {
        expect(
            totalNumberOfOrderDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                OrderDirection.Desc,
            ),
        ).toEqual({
            measures: ['AiSalesAgentOrders.gmv'],
            dimensions: [
                AiSalesAgentOrdersDimension.TicketId,
                AiSalesAgentOrdersDimension.OrderId,
                AiSalesAgentOrdersDimension.TotalAmount,
                AiSalesAgentOrdersDimension.CustomerId,
            ],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.IsInfluenced,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentOrdersDimension.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-01-01T00:00:00.000'],
                },
                {
                    member: AiSalesAgentOrdersDimension.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-01-02T00:00:00.000'],
                },
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [AiSalesAgentOrdersDimension.TicketId, OrderDirection.Desc],
            ],
            timezone: 'UTC',
        })
    })
})

describe('totalNumberProductRecommendationsDrillDownQueryFactory', () => {
    it('should build a query', () => {
        expect(
            totalNumberProductRecommendationsDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
            ),
        ).toEqual({
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.ProductId,
                AiSalesAgentConversationsDimension.StoreIntegrationId,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.ProductId,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with sorting', () => {
        expect(
            totalNumberProductRecommendationsDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                OrderDirection.Desc,
            ),
        ).toEqual({
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.ProductId,
                AiSalesAgentConversationsDimension.StoreIntegrationId,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.ProductId,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentConversationsDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [
                [
                    AiSalesAgentConversationsDimension.TicketId,
                    OrderDirection.Desc,
                ],
            ],
            timezone: 'UTC',
        })
    })
})

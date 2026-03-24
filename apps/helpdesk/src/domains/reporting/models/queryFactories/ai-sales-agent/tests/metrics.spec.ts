import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    SuccessRateDimension,
    SuccessRateFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import {
    discountCodesOfferedDrillDownQueryFactory,
    gmvInfluencedQueryFactory,
    successRateV2DrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_SALES_CONVERSATIONS_DRILL_DOWN,
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
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_SALES_CONVERSATIONS_DRILL_DOWN,
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
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
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
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
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
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED_DRILL_DOWN,
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
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED_DRILL_DOWN,
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
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_ORDER_DRILL_DOWN,
            measures: ['AiSalesAgentOrders.gmv'],
            dimensions: [
                AiSalesAgentOrdersDimension.TicketId,
                AiSalesAgentOrdersDimension.OrderId,
                AiSalesAgentOrdersDimension.TotalAmount,
                AiSalesAgentOrdersDimension.CustomerId,
            ],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
                },
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_ORDER_DRILL_DOWN,
            measures: ['AiSalesAgentOrders.gmv'],
            dimensions: [
                AiSalesAgentOrdersDimension.TicketId,
                AiSalesAgentOrdersDimension.OrderId,
                AiSalesAgentOrdersDimension.TotalAmount,
                AiSalesAgentOrdersDimension.CustomerId,
            ],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
                },
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS_DRILL_DOWN,
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.ProductIds,
                AiSalesAgentConversationsDimension.ProductVariantIds,
                AiSalesAgentConversationsDimension.StoreIntegrationId,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.ProductIds,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS_DRILL_DOWN,
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.ProductIds,
                AiSalesAgentConversationsDimension.ProductVariantIds,
                AiSalesAgentConversationsDimension.StoreIntegrationId,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.ProductIds,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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

    it('should build a query with productId', () => {
        expect(
            totalNumberProductRecommendationsDrillDownQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                undefined,
                '123',
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS_DRILL_DOWN,
            measures: ['AiSalesAgentConversations.count'],
            dimensions: [
                AiSalesAgentConversationsDimension.TicketId,
                AiSalesAgentConversationsDimension.ProductIds,
                AiSalesAgentConversationsDimension.ProductVariantIds,
                AiSalesAgentConversationsDimension.StoreIntegrationId,
            ],
            filters: [
                {
                    member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentConversationsDimension.ProductIds,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
                {
                    member: AiSalesAgentConversationsDimension.ProductIds,
                    operator: ReportingFilterOperator.Contains,
                    values: ['123'],
                },
                {
                    member: AiSalesAgentConversationsDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
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
})

describe('gmvInfluencedQueryFactory', () => {
    it('should build a query without integrationIds', () => {
        expect(
            gmvInfluencedQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
            measures: [AiSalesAgentOrdersMeasure.Gmv],
            dimensions: [AiSalesAgentOrdersDimension.Currency],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.IsInfluenced,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentOrdersDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentOrdersDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            timezone: 'UTC',
        })
    })

    it('should build a query with single integrationId', () => {
        expect(
            gmvInfluencedQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                ['integration-123'],
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
            measures: [AiSalesAgentOrdersMeasure.Gmv],
            dimensions: [AiSalesAgentOrdersDimension.Currency],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.IsInfluenced,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentOrdersDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
                },
                {
                    member: AiSalesAgentOrdersDimension.IntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['integration-123'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentOrdersDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            timezone: 'UTC',
        })
    })

    it('should build a query with multiple integrationIds', () => {
        expect(
            gmvInfluencedQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                ['integration-123', 'integration-456'],
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
            measures: [AiSalesAgentOrdersMeasure.Gmv],
            dimensions: [AiSalesAgentOrdersDimension.Currency],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.IsInfluenced,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentOrdersDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
                },
                {
                    member: AiSalesAgentOrdersDimension.IntegrationId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['integration-123', 'integration-456'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentOrdersDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            timezone: 'UTC',
        })
    })

    it('should build a query with empty integrationIds array', () => {
        expect(
            gmvInfluencedQueryFactory(
                {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                'UTC',
                [],
            ),
        ).toEqual({
            metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
            measures: [AiSalesAgentOrdersMeasure.Gmv],
            dimensions: [AiSalesAgentOrdersDimension.Currency],
            filters: [
                {
                    member: AiSalesAgentOrdersDimension.IsInfluenced,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: AiSalesAgentOrdersDimension.Source,
                    operator: ReportingFilterOperator.Equals,
                    values: ['shopping-assistant'],
                },
                ...statsFiltersToReportingFilters(
                    aiSalesAgentOrdersDefaultFiltersMembers,
                    {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                ),
            ],
            timezone: 'UTC',
        })
    })
})

const successRateFiltersMembers = {
    periodStart: SuccessRateFilterMember.PeriodStart,
    periodEnd: SuccessRateFilterMember.PeriodEnd,
    storeIntegrations: SuccessRateFilterMember.StoreIntegrationId,
}

describe('successRateV2DrillDownQueryFactory', () => {
    it('should build a query', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
        }

        expect(successRateV2DrillDownQueryFactory(filters, 'UTC')).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentSkill,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with storeIntegrationId filter', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
            storeIntegrations: {
                values: [123],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        }

        expect(successRateV2DrillDownQueryFactory(filters, 'UTC')).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentSkill,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [],
            timezone: 'UTC',
        })
    })

    it('should build a query with sorting', () => {
        const filters = {
            period: {
                start_datetime: '2021-01-01T00:00:00Z',
                end_datetime: '2021-01-02T00:00:00Z',
            },
        }

        expect(
            successRateV2DrillDownQueryFactory(
                filters,
                'UTC',
                OrderDirection.Desc,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
            measures: [],
            dimensions: [SuccessRateDimension.TicketId],
            filters: [
                {
                    member: SuccessRateFilterMember.AiAgentSkill,
                    operator: ReportingFilterOperator.Equals,
                    values: [AIAgentSkills.AIAgentSales],
                },
                ...statsFiltersToReportingFilters(
                    successRateFiltersMembers,
                    filters,
                ),
            ],
            limit: DRILLDOWN_QUERY_LIMIT,
            order: [[SuccessRateDimension.TicketId, OrderDirection.Desc]],
            timezone: 'UTC',
        })
    })
})

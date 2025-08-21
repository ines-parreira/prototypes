import {
    AiSalesAgentConversationsCube,
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsFilterMember,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
    ProductRecommendation,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrderCustomersCube,
    AiSalesAgentOrderCustomersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import {
    ConvertTrackingEventsCube,
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrderCustomersDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
    clicksDefaultFilters,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const baseAISalesAgentOrdersFilters = [
    {
        member: AiSalesAgentOrdersDimension.Source,
        operator: ReportingFilterOperator.Equals,
        values: [SourceFilter.ShoppingAssistant],
    },
]

const baseAISalesAgentConversationsFilters = [
    {
        member: AiSalesAgentConversationsDimension.Source,
        operator: ReportingFilterOperator.Equals,
        values: [SourceFilter.ShoppingAssistant],
    },
]

export const averageOrderValueQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    return {
        measures: [
            AiSalesAgentOrdersMeasure.GmvUsd,
            AiSalesAgentOrdersMeasure.Count,
        ],
        dimensions: [],
        filters: [
            ...baseAISalesAgentOrdersFilters,
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
        ],
        timezone,
    }
}

export const averageOrderValuePreviewQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    return {
        measures: [
            AiSalesAgentOrdersMeasure.GmvUsd,
            AiSalesAgentOrdersMeasure.Count,
        ],
        dimensions: [],
        filters: [
            ...baseAISalesAgentOrdersFilters,
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
        ],
        timezone,
    }
}

export const gmvUSDQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.GmvUsd],
    dimensions: [],
    filters: [
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const gmvUSDInfluencedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.GmvUsd],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const gmvInfluencedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    dimensions: [AiSalesAgentOrdersDimension.Currency],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...baseAISalesAgentOrdersFilters,
        ...(integrationIds && integrationIds.length > 0
            ? [
                  {
                      member: AiSalesAgentOrdersDimension.IntegrationId,
                      operator: ReportingFilterOperator.In,
                      values: integrationIds,
                  },
              ]
            : []),
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const gmvQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    dimensions: [AiSalesAgentOrdersDimension.Currency],
    filters: [
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberOfOrderQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    onlyInfluenced = true,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    const influencedFilter = onlyInfluenced
        ? [
              {
                  member: AiSalesAgentOrdersDimension.IsInfluenced,
                  operator: ReportingFilterOperator.Equals,
                  values: ['1'],
              },
          ]
        : []

    return {
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [],
        filters: [
            ...baseAISalesAgentOrdersFilters,
            ...influencedFilter,
            ...baseFilters,
        ],
        timezone,
    }
}

export const totalNumberOfOrderDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    ...totalNumberOfOrderQueryFactory(filters, timezone),
    dimensions: [
        AiSalesAgentOrdersDimension.TicketId,
        AiSalesAgentOrdersDimension.OrderId,
        AiSalesAgentOrdersDimension.TotalAmount,
        AiSalesAgentOrdersDimension.CustomerId,
    ],
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentOrdersDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory =
    (
        filters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
    ): ReportingQuery<AiSalesAgentConversationsCube> => ({
        ...totalNumberOfSalesConversationsQueryFactory(filters, timezone),
        dimensions: [
            AiSalesAgentConversationsDimension.TicketId,
            AiSalesAgentConversationsDimension.Outcome,
        ],
        measures: [],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [AiSalesAgentConversationsDimension.TicketId, sorting],
                  ],
              }
            : {
                  order: [],
              }),
    })

export const totalNumberOfSalesConversationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberOfAutomatedSalesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentConversationsFilterMember.Outcome,
            operator: ReportingFilterOperator.NotEquals,
            values: ['handover'],
        },
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberOfAutomatedSalesDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...totalNumberOfAutomatedSalesQueryFactory(filters, timezone),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const totalNumberProductRecommendationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    productId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
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
        ...(productId
            ? [
                  {
                      member: AiSalesAgentConversationsDimension.ProductIds,
                      operator: ReportingFilterOperator.Contains,
                      values: [productId],
                  },
              ]
            : []),
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberProductRecommendationsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    productId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...totalNumberProductRecommendationsQueryFactory(
        filters,
        timezone,
        productId,
    ),
    dimensions: [
        AiSalesAgentConversationsDimension.TicketId,
        AiSalesAgentConversationsDimension.ProductIds,
        AiSalesAgentConversationsDimension.ProductVariantIds,
        AiSalesAgentConversationsDimension.StoreIntegrationId,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting
        ? [[AiSalesAgentConversationsDimension.TicketId, sorting]]
        : [],
})

export const totalProductClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<ConvertTrackingEventsCube> => ({
    measures: [ConvertTrackingEventsMeasure.UniqClicks],
    dimensions: [],
    filters: [
        {
            member: ConvertTrackingEventsDimension.Source,
            operator: ReportingFilterOperator.Equals,
            values: ['ai-agent'],
        },
        ...clicksDefaultFilters(filters),
    ],
    timezone,
})

export const productClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<ConvertTrackingEventsCube> => ({
    measures: [ConvertTrackingEventsMeasure.UniqClicks],
    dimensions: [ConvertTrackingEventsDimension.ProductId],
    filters: [
        {
            member: ConvertTrackingEventsDimension.Source,
            operator: ReportingFilterOperator.Equals,
            values: ['ai-agent'],
        },
        ...clicksDefaultFilters(filters),
    ],
    timezone,
})

export const totalProductBoughtQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentOrdersDimension.InfluencedBy,
            operator: ReportingFilterOperator.Equals,
            values: [ProductRecommendation],
        },
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const productBoughtQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.UniqCount],
    dimensions: [AiSalesAgentOrdersDimension.InfluencedProductId],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentOrdersDimension.InfluencedBy,
            operator: ReportingFilterOperator.Equals,
            values: [ProductRecommendation],
        },
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const productRecommendationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [AiSalesAgentConversationsDimension.ProductIds],
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
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    order: [[AiSalesAgentConversationsMeasure.Count, OrderDirection.Desc]],
    limit: 25,
    timezone,
})

export const topProductRecommendationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Count],
    dimensions: [AiSalesAgentOrdersDimension.ProductId],
    filters: [
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    order: [[AiSalesAgentOrdersMeasure.Count, OrderDirection.Desc]],
    limit: 10, // fetch more just in case
    timezone,
})

export const topLocationsRecommendationsQueryFactory = (
    filters: StatsFilters,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    return {
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [AiSalesAgentOrdersDimension.ShippingCity],
        filters: [
            ...baseAISalesAgentOrdersFilters,
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
        ],
        order: [[AiSalesAgentOrdersMeasure.Count, OrderDirection.Desc]],
        limit: 4,
    }
}

export const discountCodesOfferedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
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
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const discountCodesOfferedDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...discountCodesOfferedQueryFactory(filters, timezone),
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const discountCodesAppliedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentOrdersDimension.InfluencedBy,
            operator: ReportingFilterOperator.Equals,
            values: ['discount-code'],
        },
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const discountCodesAverageQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.AverageDiscountUsd],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentOrdersDimension.InfluencedBy,
            operator: ReportingFilterOperator.Equals,
            values: ['discount-code'],
        },
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberOfGroupedSalesOpportunityConvFromAIAgentQueryFactory = (
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [AiSalesAgentConversationsDimension.StoreIntegrationId],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...baseAISalesAgentOrdersFilters,
    ],
    timezone,
})

export const repeatRateQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrderCustomersCube> => ({
    measures: [
        AiSalesAgentOrderCustomersMeasure.Count,
        AiSalesAgentOrderCustomersMeasure.RecurringCount,
    ],
    dimensions: [],
    filters: [
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrderCustomersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const averageDiscountPercentageQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.AverageDiscountPercentage],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.TotalDiscount,
            operator: ReportingFilterOperator.Gt,
            values: ['0'],
        },
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsFilterMember,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
    ProductRecommendation,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { AiSalesAgentOrderCustomersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { AiSalesAgentOrderCustomersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { SuccessRateCube } from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import {
    SuccessRateDimension,
    SuccessRateFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import type { ConvertTrackingEventsCube } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import {
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
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
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
            AiSalesAgentOrdersMeasure.Gmv,
            AiSalesAgentOrdersMeasure.Count,
        ],
        dimensions: [AiSalesAgentOrdersDimension.Currency],
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
        metricName: METRIC_NAMES.AI_SALES_AGENT_AVERAGE_ORDER_VALUE,
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
        metricName: METRIC_NAMES.AI_SALES_AGENT_AVERAGE_ORDER_VALUE_INFLUENCED,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_USD,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_USD_INFLUENCED,
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
                      operator: ReportingFilterOperator.Equals,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_GMV,
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
        metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_ORDER,
    }
}

export const totalNumberOfOrderDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    ...totalNumberOfOrderQueryFactory(filters, timezone),
    metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_ORDER_DRILL_DOWN,
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
        metricName:
            METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_SALES_CONVERSATIONS_DRILL_DOWN,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_SALES_CONVERSATIONS,
})

export const automatedSalesConversationsQueryFactory = (
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_AUTOMATED_SALES_CONVERSATIONS,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES,
})

export const totalNumberOfAutomatedSalesDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...totalNumberOfAutomatedSalesQueryFactory(filters, timezone),
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS,
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
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS_DRILL_DOWN,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_UNIQUE_CLICKS,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_PRODUCT_CLICKS,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_BOUGHT,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_PRODUCT_BOUGHT,
})

export const productRecommendationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [AiSalesAgentConversationsDimension.ProductId],
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_PRODUCT_RECOMMENDATIONS_COUNT,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_TOP_PRODUCT_RECOMMENDATIONS,
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
        metricName: METRIC_NAMES.AI_SALES_AGENT_TOP_LOCATIONS,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED,
})

export const discountCodesOfferedDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...discountCodesOfferedQueryFactory(filters, timezone),
    metricName: METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED_DRILL_DOWN,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_APPLIED,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_AVERAGE,
})

export const totalNumberOfGroupedSalesOpportunityConvFromAIAgentQueryFactory = (
    filters: StatsFilters,
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
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
    metricName: METRIC_NAMES.AI_SALES_AGENT_GROUPED_SALES_OPPORTUNITY,
})

export const repeatRateQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrderCustomersCube> => ({
    metricName: METRIC_NAMES.AI_SALES_AGENT_REPEAT_RATE,
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_AVERAGE_DISCOUNT_PERCENTAGE,
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

export const gmvByInfluencedProductQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    dimensions: [
        AiSalesAgentOrdersDimension.InfluencedProductId,
        AiSalesAgentOrdersDimension.IntegrationId,
        AiSalesAgentOrdersDimension.Currency,
    ],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentOrdersDimension.InfluencedProductId,
            operator: ReportingFilterOperator.Set,
            values: [],
        },
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    order: [[AiSalesAgentOrdersMeasure.Gmv, OrderDirection.Desc]],
    limit: 10,
    timezone,
    metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_BY_INFLUENCED_PRODUCT,
})

const successRateFiltersMembers = {
    periodStart: SuccessRateFilterMember.PeriodStart,
    periodEnd: SuccessRateFilterMember.PeriodEnd,
    storeIntegrations: SuccessRateFilterMember.StoreIntegrationId,
}

export const successRateV2DrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<SuccessRateCube> => ({
    measures: [],
    dimensions: [SuccessRateDimension.TicketId],
    filters: [
        {
            member: SuccessRateFilterMember.AiAgentSkill,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSales],
        },
        ...statsFiltersToReportingFilters(successRateFiltersMembers, filters),
    ],
    timezone,
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES_DRILL_DOWN,
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? { order: [[SuccessRateDimension.TicketId, sorting]] }
        : { order: [] }),
})

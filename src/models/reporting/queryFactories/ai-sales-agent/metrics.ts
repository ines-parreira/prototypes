import { OrderDirection } from 'models/api/types'
import {
    AiSalesAgentConversationsCube,
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsFilterMember,
    AiSalesAgentConversationsMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersFilterMember,
    AiSalesAgentOrdersMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ConvertTrackingEventsCube,
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'models/reporting/cubes/convert/ConvertTrackingEventsCube'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
    clicksDefaultFilters,
} from 'models/reporting/queryFactories/ai-sales-agent/filters'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { statsFiltersToReportingFilters } from 'utils/reporting'

import {
    AiSalesAgentOrderCustomersCube,
    AiSalesAgentOrderCustomersFilterMember,
    AiSalesAgentOrderCustomersMeasure,
} from '../../cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'

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
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
        ],
        timezone,
    }
}

export const averageOrderValueLastMonthQueryFactory = (
    storeIntegrationId: number,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    return {
        measures: [
            AiSalesAgentOrdersMeasure.GmvUsd,
            AiSalesAgentOrdersMeasure.Count,
        ],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentOrdersFilterMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [
                    new Date(
                        new Date().setMonth(new Date().getMonth() - 1),
                    ).toUTCString(),
                ],
            },
            {
                member: AiSalesAgentOrdersFilterMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [new Date().toUTCString()],
            },
            {
                member: AiSalesAgentOrdersFilterMember.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [storeIntegrationId.toString()],
            },
        ],
    }
}

export const gmvQueryFactory = (
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

export const gmvInfluencedQueryFactory = (
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
        filters: [...influencedFilter, ...baseFilters],
        timezone,
    }
}

export const totalNumberofSalesOpportunityConvFromAIAgentQueryFactory = (
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
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberOfAutomatedConversationQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentConversationsFilterMember.Outcome,
            operator: ReportingFilterOperator.NotEquals,
            values: ['handover'],
        },
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberOfAgentConversationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
    filters: [
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
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalNumberProductRecommendationsQueryFactory = (
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
            member: AiSalesAgentConversationsDimension.ProductId,
            operator: ReportingFilterOperator.Set,
            values: [],
        },
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const totalProductClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<ConvertTrackingEventsCube> => ({
    measures: [ConvertTrackingEventsMeasure.Clicks],
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
    measures: [ConvertTrackingEventsMeasure.Clicks],
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
            member: AiSalesAgentOrdersDimension.InfluencedProductId,
            operator: ReportingFilterOperator.Set,
            values: [],
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
    measures: [AiSalesAgentOrdersMeasure.Count],
    dimensions: [AiSalesAgentOrdersDimension.InfluencedProductId],
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
    dimensions: [AiSalesAgentConversationsDimension.ProductId],
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
            filters,
        ),
    ],
    timezone,
})

export const topProductRecommendationsQueryFactory = (
    storeIntegrationId: number,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Count],
    dimensions: [AiSalesAgentOrdersDimension.ProductId],
    filters: [
        {
            member: AiSalesAgentOrdersFilterMember.IntegrationId,
            operator: ReportingFilterOperator.Equals,
            values: [storeIntegrationId.toString()],
        },
    ],
    order: [[AiSalesAgentOrdersMeasure.Count, OrderDirection.Desc]],
    limit: 10, // fetch more just in case
})

export const topLocationsRecommendationsQueryFactory = (
    filters: StatsFilters,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    return {
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [AiSalesAgentOrdersDimension.ShippingCity],
        filters: [
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
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
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
    ],
    timezone,
})

export const repeatRateQueryFactory = (
    storeIntegrationId: number,
): ReportingQuery<AiSalesAgentOrderCustomersCube> => ({
    measures: [
        AiSalesAgentOrderCustomersMeasure.Count,
        AiSalesAgentOrderCustomersMeasure.RecurringCount,
    ],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrderCustomersFilterMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [
                new Date(
                    new Date().setMonth(new Date().getMonth() - 1),
                ).toUTCString(),
            ],
        },
        {
            member: AiSalesAgentOrderCustomersFilterMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [new Date().toUTCString()],
        },
        {
            member: AiSalesAgentOrderCustomersFilterMember.IntegrationId,
            operator: ReportingFilterOperator.Equals,
            values: [storeIntegrationId.toString()],
        },
    ],
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
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

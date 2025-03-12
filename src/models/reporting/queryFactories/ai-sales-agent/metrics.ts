import {
    AiSalesAgentConversationsCube,
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsFilterMember,
    AiSalesAgentConversationsMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
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

export const averageOrderValueQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    return {
        measures: [
            AiSalesAgentOrdersMeasure.Gmv,
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
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Count],
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
    measures: [AiSalesAgentOrdersMeasure.AverageDiscount],
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

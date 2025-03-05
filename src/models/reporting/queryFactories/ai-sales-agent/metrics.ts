import {
    AiSalesAgentConversationsCube,
    AiSalesAgentConversationsDimension,
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
    aiSalesAgentConversationsDefaultFilters,
    aiSalesAgentOrdersDefaultFilters,
    clicksDefaultFilters,
} from 'models/reporting/queryFactories/ai-sales-agent/filters'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

export const averageOrderValueQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv, AiSalesAgentOrdersMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...aiSalesAgentOrdersDefaultFilters(filters),
    ],
    timezone,
})

export const gmvQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    dimensions: [],
    filters: [...aiSalesAgentOrdersDefaultFilters(filters)],
    timezone,
})

export const gmvInfluencedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...aiSalesAgentOrdersDefaultFilters(filters),
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
        ...aiSalesAgentOrdersDefaultFilters(filters),
    ],
    timezone,
})

export const totalNumberConverFromAIAgentQueryFactory = (
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
        ...aiSalesAgentConversationsDefaultFilters(filters),
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
        ...aiSalesAgentConversationsDefaultFilters(filters),
    ],
    timezone,
})

export const productClicksQueryFactory = (
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
        ...aiSalesAgentOrdersDefaultFilters(filters),
    ],
    timezone,
})

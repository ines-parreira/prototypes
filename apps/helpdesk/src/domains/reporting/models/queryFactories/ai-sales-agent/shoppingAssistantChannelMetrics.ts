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
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { statsFiltersToReportingFilters } from 'domains/reporting/utils/reporting'
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

export const handoverInteractionsFromConversationsPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [AiSalesAgentConversationsDimension.Channel],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentConversationsFilterMember.Outcome,
            operator: ReportingFilterOperator.Equals,
            values: ['handover'],
        },
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_PER_CHANNEL,
})

export const ordersInfluencedPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Count],
    dimensions: [AiSalesAgentOrdersDimension.Channel],
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
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_SHOPPING_ASSISTANT_ORDERS_INFLUENCED_PER_CHANNEL,
})

export const shoppingAssistantTopProductsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [
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
    metricName: METRIC_NAMES.AI_SALES_AGENT_SHOPPING_ASSISTANT_TOP_PRODUCTS,
})
